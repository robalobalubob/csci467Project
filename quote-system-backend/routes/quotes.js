const express = require('express');
const router = express.Router();
const { Quote, LineItem, LegacyCustomer, User, sequelize } = require('../models');

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

// Create a new quote
router.post('/', async (req, res) => {
  const { associateId, customerId, email, secretNotes, items } = req.body;

  try {
    const createdQuote = await sequelize.transaction(async (transaction) => {
      // Validate customer existence within the transaction
      const customer = await LegacyCustomer.findOne({
        where: { id: customerId },
      });

      if (!customer) {
        throw { status: 400, message: 'Invalid customer ID.' };
      }

      // Validate line items
      const validationError = validateLineItems(items);
      if (validationError) {
        throw validationError;
      }

      // Calculate total amount
      const lineItemsTotal = items.reduce((sum, item) => sum + parseFloat(item.price), 0);

      // Create the quote
      const newQuote = await Quote.create({
        associateId,
        customerId,
        email,
        secretNotes,
        status: 'draft',
        totalAmount: lineItemsTotal,
      }, { transaction });

      // Create associated line items
      const lineItemsToCreate = items.map(item => ({
        description: item.description,
        price: item.price,
        quoteId: newQuote.quoteId,
      }));

      await LineItem.bulkCreate(lineItemsToCreate, { transaction });

      // Fetch the newly created quote along with its items within the transaction
      const createdQuoteWithItems = await Quote.findOne({
        where: { quoteId: newQuote.quoteId },
        include: [{
          model: LineItem,
          as: 'items',
        }],
        transaction,
      });

      return createdQuoteWithItems;
    });

    res.status(201).json(createdQuote);
  } catch (error) {
    console.error('Error creating quote:', error);
    if (error.status && error.message) {
      res.status(error.status).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Server error while creating the quote.' });
    }
  }
});


router.put('/:quoteId', async (req, res) => {
  const { quoteId } = req.params;
  const { associateId, customerId, email, secretNotes, items, discount, discountType, status } = req.body;

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

      // Ensure Quote is in 'draft' status
      if (quote.status !== 'draft') {
        throw { status: 400, message: 'Only draft quotes can be edited.' };
      }

      // Validate line items
      const validationError = validateLineItems(items);
      if (validationError) {
        throw validationError;
      }

      // Update quote details
      await quote.update({
        associateId,
        customerId,
        email,
        secretNotes,
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

      // Fetch the updated quote along with its items within the transaction
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

router.get('/', async (req, res) => {
  const { associate_id } = req.query;

  if (!associate_id) {
    return res.status(400).json({ success: false, message: 'associate_id query parameter is required.' });
  }

  try {
    const quotes = await Quote.findAll({
      where: { associateId: associate_id, status: 'draft' },
      include: [{
        model: LineItem,
        as: 'items',
      }],
    });

    res.json(quotes);
  } catch (error) {
    console.error('Error retrieving quotes:', error);
    res.status(500).json({ success: false, message: 'Server error while retrieving quotes.' });
  }
});

// Submit a quote
router.post('/:quoteId/submit', async (req, res) => {
  const { quoteId } = req.params;

  try {
    const submittedQuote = await sequelize.transaction(async (transaction) => {
      const quote = await Quote.findOne({
        where: { quoteId },
        include: [{ model: LineItem, as: 'items' }],
        transaction,
      });

      if (!quote) {
        throw { status: 404, message: 'Quote not found.' };
      }

      // Ensure the quote is in 'draft' status before submitting
      if (quote.status !== 'draft') {
        throw { status: 400, message: 'Only draft quotes can be submitted.' };
      }

      // Ensure there is at least one line item
      if (!Array.isArray(quote.items) || quote.items.length === 0) {
        throw { status: 400, message: 'Cannot submit a quote without line items.' };
      }

      // Update quote status to 'submitted'
      await quote.update({ status: 'submitted' }, { transaction });

      return quote;
    });

    res.json({ success: true, message: 'Quote submitted successfully.', quote: submittedQuote });
  } catch (error) {
    console.error('Error submitting quote:', error);
    if (error.status && error.message) {
      res.status(error.status).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Server error while submitting the quote.' });
    }
  }
});

router.delete('/:quoteId', async (req, res) => {
  const { quoteId } = req.params;

  try {
    await sequelize.transaction(async (transaction) => {
      const quote = await Quote.findByPk(quoteId, { transaction });

      if (!quote) {
        throw { status: 404, message: 'Quote not found.' };
      }

      // Only allow deletion of quotes in 'draft' status
      if (quote.status !== 'draft') {
        throw { status: 400, message: 'Only draft quotes can be deleted.' };
      }

      // Delete associated line items
      await LineItem.destroy({ where: { quoteId }, transaction });

      // Delete the quote
      await quote.destroy({ transaction });
    });

    res.json({ success: true, message: 'Quote deleted successfully.' });
  } catch (error) {
    console.error('Error deleting quote:', error);
    if (error.status && error.message) {
      res.status(error.status).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Server error while deleting the quote.' });
    }
  }
});

module.exports = router;
