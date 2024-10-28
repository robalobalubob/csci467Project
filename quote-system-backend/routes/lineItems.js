const express = require('express');
const router = express.Router();
const { LineItem, Quote } = require('../models');

// Create a new line item
router.post('/', async (req, res) => {
  try {
    const { quoteId, description, price } = req.body;
    const newLineItem = await LineItem.create({ quoteId, description, price });
    res.status(201).json(newLineItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all line items
router.get('/', async (req, res) => {
  try {
    const lineItems = await LineItem.findAll({ include: [Quote] });
    res.status(200).json(lineItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single line item by ID
router.get('/:id', async (req, res) => {
  try {
    const lineItem = await LineItem.findByPk(req.params.id, { include: [Quote] });
    if (lineItem) {
      res.status(200).json(lineItem);
    } else {
      res.status(404).json({ error: 'Line Item not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a line item by ID
router.put('/:id', async (req, res) => {
  try {
    const { quoteId, description, price } = req.body;
    const lineItem = await LineItem.findByPk(req.params.id);
    if (lineItem) {
      await lineItem.update({ quoteId, description, price });
      res.status(200).json(lineItem);
    } else {
      res.status(404).json({ error: 'Line Item not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a line item by ID
router.delete('/:id', async (req, res) => {
  try {
    const lineItem = await LineItem.findByPk(req.params.id);
    if (lineItem) {
      await lineItem.destroy();
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Line Item not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
