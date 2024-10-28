const express = require('express');
const router = express.Router();
const { Quote, User, LineItem } = require('../models');

// Create a new quote
router.post('/', async (req, res) => {
  try {
    const { customerId, associateId, email, secretNotes, status } = req.body;
    const newQuote = await Quote.create({ customerId, associateId, email, secretNotes, status });
    res.status(201).json(newQuote);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all quotes
router.get('/', async (req, res) => {
  try {
    const quotes = await Quote.findAll({ include: [User, LineItem] });
    res.status(200).json(quotes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single quote by ID
router.get('/:id', async (req, res) => {
  try {
    const quote = await Quote.findByPk(req.params.id, { include: [User, LineItem] });
    if (quote) {
      res.status(200).json(quote);
    } else {
      res.status(404).json({ error: 'Quote not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a quote by ID
router.put('/:id', async (req, res) => {
  try {
    const { customerId, associateId, email, secretNotes, status } = req.body;
    const quote = await Quote.findByPk(req.params.id);
    if (quote) {
      await quote.update({ customerId, associateId, email, secretNotes, status });
      res.status(200).json(quote);
    } else {
      res.status(404).json({ error: 'Quote not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a quote by ID
router.delete('/:id', async (req, res) => {
  try {
    const quote = await Quote.findByPk(req.params.id);
    if (quote) {
      await quote.destroy();
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Quote not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
