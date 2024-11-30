const express = require('express');
const router = express.Router();
const { Quote, LineItem, LegacyCustomer } = require('../models');

// Create a new quote
router.post('/', async (req, res) => {
  const { associateId, customerId, email, secretNotes, items } = req.body;

  try {

    const customer = await LegacyCustomer.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid customer ID' });
    }
    
    const newQuote = await Quote.create({
      associateId,
      customerId,
      email,
      secretNotes,
      status: 'draft',
    });

    // Create associated line items
    if (items && items.length > 0) {
      const lineItems = items.map(item => ({
        description: item.description,
        price: item.price,
        quoteId: newQuote.quoteId,
      }));
      await LineItem.bulkCreate(lineItems);
    }

    res.status(201).json(newQuote);
  } catch (error) {
    console.error('Error creating quote:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/:quoteId', async (req, res) => {
  const { quoteId } = req.params;
  const { associateId, customerId, email, secretNotes, items } = req.body;

  try {
    const quote = await Quote.findByPk(quoteId, {
      include: [{ model: LineItem, as: 'items' }],
    });

    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quote not found' });
    }

    // Update quote details
    await quote.update({ associateId, customerId, email, secretNotes });

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
        });
        processedItemIds.add(item.lineItemId);
      } else {
        // Create new item
        await LineItem.create({
          description: item.description,
          price: item.price,
          quoteId: quoteId,
        });
      }
    }

    // Delete items that are not in the incoming items
    for (const item of existingItems) {
      if (!processedItemIds.has(item.lineItemId)) {
        await item.destroy();
      }
    }

    res.json({ success: true, message: 'Quote updated' });
  } catch (error) {
    console.error('Error updating quote:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  const { associate_id } = req.query;

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
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Submit a quote
router.post('/:quoteId/submit', async (req, res) => {
  const { quoteId } = req.params;

  try {
    const quote = await Quote.findByPk(quoteId);

    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quote not found' });
    }

    // Ensure the quote is in 'draft' status before finalizing
    if (quote.status !== 'draft') {
      return res.status(400).json({ success: false, message: 'Only draft quotes can be submitted' });
    }

    // Update quote status to 'submitted'
    await quote.update({ status: 'submitted' });

    res.json({ success: true, message: 'Quote submitted', quote });
  } catch (error) {
    console.error('Error finalizing quote:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/:quoteId', async (req, res) => {
  const { quoteId } = req.params;

  try {
    const quote = await Quote.findByPk(quoteId);

    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quote not found' });
    }

    // Only allow deletion of quotes in 'draft' status
    if (quote.status !== 'draft') {
      return res.status(400).json({ success: false, message: 'Only draft quotes can be deleted' });
    }

    // Delete associated line items
    await LineItem.destroy({ where: { quoteId } });

    // Delete the quote
    await quote.destroy();

    res.json({ success: true, message: 'Quote deleted' });
  } catch (error) {
    console.error('Error deleting quote:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
