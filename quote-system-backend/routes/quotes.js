const express = require('express');
const router = express.Router();
const { Quote, LineItem } = require('../models');

// Create a new quote
router.post('/quotes', async (req, res) => {
  const { associateId, customerId, email, secretNotes, items } = req.body;

  try {
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

router.put('/quotes/:quoteId', async (req, res) => {
  const { quoteId } = req.params;
  const { description, items } = req.body;

  try {
    const quote = await Quote.findByPk(quoteId);

    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quote not found' });
    }

    // Update quote details
    await quote.update({ description });

    // Update line items
    // For simplicity, delete existing items and re-create them
    await LineItem.destroy({ where: { quoteId } });

    if (items && items.length > 0) {
      const lineItems = items.map(item => ({
        ...item,
        quoteId,
      }));
      await LineItem.bulkCreate(lineItems);
    }

    res.json({ success: true, message: 'Quote updated' });
  } catch (error) {
    console.error('Error updating quote:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/quotes', async (req, res) => {
  const { associate_id } = req.query;

  try {
    const quotes = await Quote.findAll({
      where: { associateId: associate_id, status: 'draft' },
      include: [LineItem],
    });

    res.json(quotes);
  } catch (error) {
    console.error('Error retrieving quotes:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
