const express = require('express');
const router = express.Router();
const { Quote, LineItem, User, sequelize } = require('../models');
const transporter = require('../emailService');
const axios = require('axios');
const EMAIL_USER = process.env.EMAIL_USER;

router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        let whereCondition = {};
    
        if (status) {
            if (Array.isArray(status)) {
            whereCondition.status = status;
            } else {
            whereCondition.status = [status];
            }
        }
    
        const quotes = await Quote.findAll({
            where: {
                status: whereCondition.status,
            },
            include: [{ model: LineItem, as: 'items' }],
        });
    
        res.json(quotes);
    } catch (error) {
        console.error('Error retrieving quotes:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.put('/:quoteId', async (req, res) => {
    const { quoteId } = req.params;
    const {
        associateId,
        customerId,
        email,
        secretNotes,
        items,
        discount,
        discountType,
        status,
    } = req.body;

    const transaction = await sequelize.transaction();
  
    try {
        const quote = await Quote.findByPk(quoteId, {
            include: [{ model: LineItem, as: 'items' }],
            transaction,
        });

        if (!quote) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: 'Quote not found' });
        }

        // Allow editing only if the quote is in 'submitted' or 'unresolved' status
        if (!['submitted', 'unresolved'].includes(quote.status)) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'Quote cannot be edited in its current status' });
        }

        // Validate that at least one line item is provided
        if (!Array.isArray(items) || items.length === 0) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'At least one line item is required.' });
        }
        
        // Validate individual line items for required fields
        for (const item of items) {
            if (!item.description || item.price < 0) {
                await transaction.rollback();
                return res.status(400).json({ success: false, message: 'Each line item must have a valid description and a non-negative price.' });
            }
        }

        // Update quote details
        await quote.update({
            associateId,
            customerId,
            email,
            secretNotes,
            discount,
            discountType,
            status: 'unresolved',
          }, { transaction });
  
        // Update line items
        // Existing line items from the database
        const existingItems = quote.items;

        // Maps for tracking line items
        const existingItemsMap = {};
        existingItems.forEach(item => {
            existingItemsMap[item.lineItemId] = item;
        });

        // Keep track of processed line items
        const processedItemIds = new Set();

        // Process incoming items
        for (const item of items) {
            if (item.lineItemId && existingItemsMap[item.lineItemId]) {
                // Update existing item
                await existingItemsMap[item.lineItemId].update({
                    description: item.description,
                    price: item.price,
                }, { transaction });
                processedItemIds.add(item.lineItemId);
            } else {
                // Create new item
                await LineItem.create({
                    description: item.description,
                    price: item.price,
                    quoteId: quoteId,
                }, { transaction });
            }
        }

        // Delete items that are not in the incoming items
        for (const item of existingItems) {
            if (!processedItemIds.has(item.lineItemId)) {
                await item.destroy({ transaction });
            }
        }
  
        // Recalculate total amount
        const lineItemsTotal = items.reduce((sum, item) => sum + parseFloat(item.price), 0);
        let totalAmount = lineItemsTotal;

        if (discountType === 'amount') {
            totalAmount -= parseFloat(discount);
          } else if (discountType === 'percentage') {
            totalAmount -= (totalAmount * parseFloat(discount)) / 100;
        }

        totalAmount = totalAmount < 0 ? 0 : totalAmount;

        await quote.update({ totalAmount }, { transaction });

        await transaction.commit();

        const updatedQuote = await Quote.findByPk(quoteId, {
            include: [{ model: LineItem, as: 'items' }],
            transaction: null, // No need for the transaction here
        });

        res.json({ success: true, message: 'Quote updated successfully.', quote: updatedQuote });
    } catch (error) {
        await transaction.rollback();
        console.error('Error updating quote:', error);
        res.status(500).json({ success: false, message: 'Server error while updating the quote.' });
    }
});

router.get('/submitted', async (req, res) => {
    try {
        const quotes = await Quote.findAll({
        where: { status: 'submitted' },
        include: [{ model: LineItem, as: 'items' }],
        });

        res.json(quotes);
    } catch (error) {
        console.error('Error retrieving submitted quotes:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
    });

router.post('/:quoteId/sanction', async (req, res) => {
    const { quoteId } = req.params;

    try {
        const quote = await Quote.findByPk(quoteId, {
        include: [{ model: LineItem, as: 'items' }],
        });

        if (!quote) {
        return res.status(404).json({ success: false, message: 'Quote not found' });
        }

        // Ensure the quote is in 'submitted' or 'unresolved' status
        if (!['submitted', 'unresolved'].includes(quote.status)) {
        return res.status(400).json({ success: false, message: 'Only submitted or unresolved quotes can be sanctioned' });
        }

        // Update quote status to 'sanctioned'
        quote.status = 'sanctioned';
        await quote.save();

        // Send email to customer excluding secret notes
        await sendQuoteEmailToCustomer(quote);

        res.json({ success: true, message: 'Quote sanctioned and emailed to customer' });
    } catch (error) {
        console.error('Error sanctioning quote:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/sanctioned', async (req, res) => {
    try {
        const quotes = await Quote.findAll({
        where: { status: 'sanctioned' },
        include: [{ model: LineItem, as: 'items' }],
        });

        res.json(quotes);
    } catch (error) {
        console.error('Error retrieving sanctioned quotes:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
    });

router.post('/:quoteId/process-order', async (req, res) => {
    const { quoteId } = req.params;
    const { finalDiscount } = req.body;
    const t = await sequelize.transaction();

    try {
        const quote = await Quote.findByPk(quoteId, { transaction: t });

        if (!quote) {
            await t.rollback();
            return res.status(404).json({ success: false, message: 'Quote not found' });
        }

        if (quote.status !== 'sanctioned') {
            await t.rollback();
            return res.status(400).json({ success: false, message: 'Only sanctioned quotes can be processed' });
        }

        const finalDiscountNumber = parseFloat(finalDiscount);
        if (isNaN(finalDiscountNumber) || finalDiscountNumber < 0 || finalDiscountNumber > quote.totalAmount) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: 'Invalid final discount amount',
            });
        }

        quote.finalDiscount = finalDiscountNumber;
        quote.finalAmount = quote.totalAmount - finalDiscountNumber;
        const curTime = Date.now();
        const purchaseOrderData = {
            order: `PO-${quote.quoteId}-${curTime}`,
            associate: quote.associateId.toString(),
            custid: quote.customerId.toString(),
            amount: quote.finalAmount.toFixed(2),
        };

        const poResponse = await sendPurchaseOrderToExternalSystem(purchaseOrderData);
        console.log('Purchase Order Response:', poResponse);

        if (poResponse.errors) {
            await t.rollback();
            return res.status(400).json({
              success: false,
              message: 'Error from external system',
              errors: poResponse.errors,
            });
        }

        const commissionRateString = poResponse.commission;
        const commissionRate = parseFloat(commissionRateString.replace('%', ''));
        if (isNaN(commissionRate)) {
            await t.rollback();
            return res.status(500).json({
                success: false,
                message: 'Invalid commission rate received from external system',
            });
        }

        quote.status = 'ordered';
        quote.processingDate = new Date(poResponse.timeStamp).toISOString();
        quote.commissionRate = commissionRate;
        await quote.save({ transaction: t });

        const associate = await User.findByPk(quote.associateId, { transaction: t });
        const finalAmount = parseFloat(quote.finalAmount);
        let accumulatedCommission = parseFloat(associate.accumulatedCommission);

        if (isNaN(accumulatedCommission)) {
            accumulatedCommission = 0;
        }

        const commission = (finalAmount * commissionRate) / 100;
        associate.accumulatedCommission = accumulatedCommission + commission;
        await associate.save({ transaction: t });

        await t.commit();

        await sendPurchaseOrderEmailToCustomer(quote);

        res.json({ success: true, message: 'Purchase order processed', data: poResponse });
    } catch (error) {
        await t.rollback();
        console.error('Error processing purchase order:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

async function sendQuoteEmailToCustomer(quote) {
    const {
        email,
        quoteId,
        associateId,
        customerId,
        totalAmount,
        discount,
        discountType,
        items,
    } = quote;

    const lineItemsHtml = items
        .map((item) => {
            const price = parseFloat(item.price);
            const priceDisplay = !isNaN(price)
            ? `$${price.toFixed(2)}`
            : 'Price not available';
            return `<li>${item.description}: ${priceDisplay}</li>`;
        })
        .join('');

    const totalBeforeDiscount = items.reduce(
        (sum, item) => sum + parseFloat(item.price),
        0
    );

    let discountAmount = 0;
    if (discountType === 'amount') {
        discountAmount = parseFloat(discount);
    } else if (discountType === 'percentage') {
        discountAmount = (totalBeforeDiscount * parseFloat(discount)) / 100;
    }

    const totalAfterDiscount = totalBeforeDiscount - discountAmount;

    const emailContent = `
        <h1>Quote #${quoteId}</h1>
        <p>Associate ID: ${associateId}</p>
        <p>Customer ID: ${customerId}</p>
        <h2>Line Items:</h2>
        <ul>${lineItemsHtml}</ul>
        <p><strong>Total Before Discount:</strong> $${totalBeforeDiscount.toFixed(2)}</p>
        <p><strong>Discount (${discountType}):</strong> $${discountAmount.toFixed(2)}</p>
        <p><strong>Total After Discount:</strong> $${totalAfterDiscount.toFixed(2)}</p>
    `;
  
    try {
      await transporter.sendMail({
        from: EMAIL_USER,
        to: email,
        subject: `Your Quote #${quoteId}`,
        html: emailContent,
      });
    } catch (error) {
      console.error('Error sending quote email:', error);
      throw error;
    }
  }

async function sendPurchaseOrderToExternalSystem(data) {
    try {
        const response = await axios.post('http://blitz.cs.niu.edu/PurchaseOrder/', data, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error communicating with external system:', error);
        throw error;
    }
}

async function sendPurchaseOrderEmailToCustomer(quote) {
    const { email, quoteId, finalAmount, processingDate } = quote;
  
    const emailContent = `
      <h1>Purchase Order Confirmation</h1>
      <p>Thank you for your order!</p>
      <p><strong>Order Number:</strong> PO-${quoteId}</p>
      <p><strong>Processing Date:</strong> ${processingDate}</p>
      <p><strong>Total Amount:</strong> $${finalAmount.toFixed(2)}</p>
    `;
  
    try {
      await transporter.sendMail({
        from: EMAIL_USER,
        to: email,
        subject: 'Your Purchase Order Confirmation',
        html: emailContent,
      });
    } catch (error) {
      console.error('Error sending purchase order email:', error);
      throw error;
    }
}

module.exports = router;