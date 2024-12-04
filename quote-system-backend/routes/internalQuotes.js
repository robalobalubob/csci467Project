const express = require('express');
const router = express.Router();
const { Quote, LineItem, User, sequelize } = require('../models');
const transporter = require('../emailService');
const axios = require('axios');
const EMAIL_USER = process.env.EMAIL_USER;

const validateLineItems = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
      return { status: 400, message: 'At least one line item is required.' };
    }
  
    for (const item of items) {
        if (!item.description) {
            return { status: 400, message: 'Each line item must have a description.' };
        }
  
        const price = parseFloat(item.price);
        if (isNaN(price) || price < 0) {
            return { status: 400, message: 'Each line item must have a non-negative price.' };
        }
  
        if (price > 99999999.99) {
            return { status: 400, message: 'Line item price exceeds the maximum allowed value.' };
        }
    }
  
    return null;
};

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
            where: whereCondition,
            include: [{ model: LineItem, as: 'items' }],
        });
    
        res.json(quotes);
    } catch (error) {
        console.error('Error retrieving quotes:', error);
        res.status(500).json({ success: false, message: 'Server error while retrieving quotes.' });
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
  
    try {
        const updatedQuote = await sequelize.transaction(async (transaction) => {
            const quote = await Quote.findByPk(quoteId, {
                include: [{ model: LineItem, as: 'items' }],
                transaction,
            });
    
            // Ensure Quote Exists
            if (!quote) {
                throw { status: 404, message: 'Quote not found.' };
            }
    
            // Allow editing only if the quote is in 'submitted' or 'unresolved' status
            if (!['submitted', 'unresolved'].includes(quote.status)) {
                throw { status: 400, message: 'Quote cannot be edited in its current status.' };
            }
    
            // Validate line items
            const validationError = validateLineItems(items);
            if (validationError) {
                throw validationError;
            }
    
            // Update quote details and set status to 'unresolved'
            await quote.update({
                associateId,
                customerId,
                email,
                secretNotes,
                discount: discount !== undefined ? discount : quote.discount,
                discountType: discountType || quote.discountType,
                status: 'unresolved',
            }, { transaction });
    
            // Update line items
            const existingItems = quote.items;
    
            // Create a map for existing items for quick lookup
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
    
            // Calculate and update total amount
            let lineItemsTotal = items.reduce((sum, item) => sum + parseFloat(item.price), 0);
            if (discount !== undefined && discountType) {
                if (discountType === 'amount') {
                    lineItemsTotal -= parseFloat(discount);
                } else if (discountType === 'percentage') {
                    lineItemsTotal -= (lineItemsTotal * parseFloat(discount)) / 100;
                }
                lineItemsTotal = lineItemsTotal < 0 ? 0 : lineItemsTotal;
            }
    
            await quote.update({ totalAmount: lineItemsTotal }, { transaction });
    
            // Fetch the updated quote with its items within the transaction
            const updatedQuoteWithItems = await Quote.findOne({
                where: { quoteId },
                include: [{ model: LineItem, as: 'items' }],
                transaction,
            });
    
            return updatedQuoteWithItems;
        });
  
      res.json({ success: true, message: 'Quote updated successfully.', quote: updatedQuote });
    } catch (error) {
      console.error('Error updating quote:', error);
      if (error.status && error.message) {
        res.status(error.status).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Server error while updating the quote.' });
      }
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
        res.status(500).json({ success: false, message: 'Server error while retrieving submitted quotes.' });
    }
});

router.post('/:quoteId/sanction', async (req, res) => {
    const { quoteId } = req.params;

    try {
      
        const sanctionedQuote = await sequelize.transaction(async (transaction) => {
            const quote = await Quote.findByPk(quoteId, {
                include: [{ model: LineItem, as: 'items' }],
                transaction,
            });
  
            if (!quote) {
                throw { status: 404, message: 'Quote not found.' };
            }
    
            // Ensure the quote is in 'submitted' or 'unresolved' status
            if (!['submitted', 'unresolved'].includes(quote.status)) {
                throw { status: 400, message: 'Only submitted or unresolved quotes can be sanctioned.' };
            }
    
            // Update quote status to 'sanctioned'
            await quote.update({ status: 'sanctioned' }, { transaction });
    
            // Calculate discount
            const totalBeforeDiscount = quote.items.reduce((sum, item) => sum + parseFloat(item.price), 0);
            let discountAmount = 0;
            if (quote.discountType === 'amount') {
                discountAmount = parseFloat(quote.discount);
            } else if (quote.discountType === 'percentage') {
                discountAmount = (totalBeforeDiscount * parseFloat(quote.discount)) / 100;
            }
            const totalAfterDiscount = totalBeforeDiscount - discountAmount;
    
            return quote;
        });
  
        // After the transaction has been committed, send the email
        try {
            await sendQuoteEmailToCustomer(sanctionedQuote);
        } catch (emailError) {
            console.error('Error sending sanction email:', emailError);
            return res.status(500).json({
                success: false,
                message: 'Quote sanctioned but failed to send email to customer.',
            });
        }
  
        res.json({ success: true, message: 'Quote sanctioned and emailed to customer.' });
    } catch (error) {
        console.error('Error sanctioning quote:', error);
        if (error.status && error.message) {
            res.status(error.status).json({ success: false, message: error.message });
        } else {
            res.status(500).json({ success: false, message: 'Server error while sanctioning the quote.' });
        }
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
        res.status(500).json({ success: false, message: 'Server error while retrieving sanctioned quotes.' });
    }
});

router.post('/:quoteId/process-order', async (req, res) => {
    const { quoteId } = req.params;
    const { finalDiscount } = req.body;
  
    try {
        const purchaseOrderResult = await sequelize.transaction(async (transaction) => {
            const quote = await Quote.findByPk(quoteId, { transaction });
    
            if (!quote) {
                throw { status: 404, message: 'Quote not found.' };
            }
    
            if (quote.status !== 'sanctioned') {
                throw { status: 400, message: 'Only sanctioned quotes can be processed into purchase orders.' };
            }
    
            const finalDiscountNumber = parseFloat(finalDiscount);
            if (isNaN(finalDiscountNumber) || finalDiscountNumber < 0 || finalDiscountNumber > parseFloat(quote.totalAmount)) {
                throw { status: 400, message: 'Invalid final discount amount.' };
            }
    
            // Calculate final amount
            const finalAmount = parseFloat(quote.totalAmount) - finalDiscountNumber;
    
            // Prepare purchase order data
            const purchaseOrderData = {
                order: `PO-${quote.quoteId}-${Date.now()}`,
                associate: quote.associateId.toString(),
                custid: quote.customerId.toString(),
                amount: finalAmount.toFixed(2),
            };
    
            // Send purchase order to external system
            const poResponse = await sendPurchaseOrderToExternalSystem(purchaseOrderData);
    
            console.log('Purchase Order Response:', poResponse);
    
            if (poResponse.errors) {
                throw { status: 400, message: 'Error from external system.', errors: poResponse.errors };
            }
    
            // Extract commission rate
            const commissionRateString = poResponse.commission;
            const commissionRate = parseFloat(commissionRateString.replace('%', ''));
            if (isNaN(commissionRate)) {
                throw { status: 500, message: 'Invalid commission rate received from external system.' };
            }
    
            // Update quote with purchase order details
            await quote.update({
                status: 'ordered',
                processingDate: new Date(poResponse.timeStamp).toISOString(),
                commissionRate,
                finalDiscount: finalDiscountNumber,
                finalAmount,
            }, { transaction });
    
            // Update associate's accumulated commission
            const associate = await User.findByPk(quote.associateId, { transaction });
            if (!associate) {
                throw { status: 404, message: 'Associate not found.' };
            }
    
            let accumulatedCommission = parseFloat(associate.accumulatedCommission);
            if (isNaN(accumulatedCommission)) {
                accumulatedCommission = 0;
            }
    
            const commissionEarned = (finalAmount * commissionRate) / 100;
            associate.accumulatedCommission = accumulatedCommission + commissionEarned;
    
            await associate.save({ transaction });
    
            return { quote, poResponse };
        });
  
        // After the transaction has been committed, send purchase order confirmation email
        try {
            await sendPurchaseOrderEmailToCustomer(purchaseOrderResult.quote, purchaseOrderResult.poResponse);
        } catch (emailError) {
            console.error('Error sending purchase order email:', emailError);
            return res.status(500).json({
                success: false,
                message: 'Purchase order processed but failed to send confirmation email to customer.',
            });
        }
    
        res.json({
            success: true,
            message: 'Purchase order processed successfully.',
            data: purchaseOrderResult.poResponse,
        });
    } catch (error) {
        console.error('Error processing purchase order:', error);
        if (error.status && error.message) {
            res.status(error.status).json({ success: false, message: error.message, errors: error.errors || undefined });
        } else {
            res.status(500).json({ success: false, message: 'Server error while processing the purchase order.' });
        }
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

async function sendPurchaseOrderEmailToCustomer(quote, response) {
    const { email, quoteId, finalAmount, processingDate } = quote;
    const { order } = response;
  
    const emailContent = `
      <h1>Purchase Order Confirmation</h1>
      <p>Thank you for your order!</p>
      <p><strong>Order Number:</strong> ${order}</p>
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