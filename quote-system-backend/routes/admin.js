const express = require('express');
const router = express.Router();
const { User, Quote, LineItem } = require('../models');
const { Op } = require('sequelize');

// Retrieve all sales associates
router.get('/associates', async (req, res) => {
    try {
      const associates = await User.findAll();
      res.json(associates);
    } catch (error) {
      console.error('Error retrieving associates:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Create a new sales associate
router.post('/associates', async (req, res) => {
    const { name, userId, password, address } = req.body;
  
    try {
      const newAssociate = await User.create({
        name,
        userId,
        password, // Consider hashing the password
        address,
        accumulatedCommission: 0,
      });
  
      res.status(201).json(newAssociate);
    } catch (error) {
      console.error('Error creating associate:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update an existing sales associate
router.put('/associates/:associateId', async (req, res) => {
    const { associateId } = req.params;
    const { name, userId, password, address } = req.body;
  
    try {
      const associate = await User.findByPk(associateId);
  
      if (!associate) {
        return res.status(404).json({ success: false, message: 'Associate not found' });
      }
  
      await associate.update({
        name,
        userId,
        password, // Handle password updates carefully
        address,
      });
  
      res.json({ success: true, message: 'Associate updated', associate });
    } catch (error) {
      console.error('Error updating associate:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete a sales associate
router.delete('/associates/:associateId', async (req, res) => {
    const { associateId } = req.params;
  
    try {
      const associate = await User.findByPk(associateId);
  
      if (!associate) {
        return res.status(404).json({ success: false, message: 'Associate not found' });
      }
  
      // Consider checking if the associate has any dependent records before deletion
  
      await associate.destroy();
  
      res.json({ success: true, message: 'Associate deleted' });
    } catch (error) {
      console.error('Error deleting associate:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Search and view quotes based on filters
router.get('/quotes', async (req, res) => {
    const { status, startDate, endDate, associateId, customerId } = req.query;
  
    const whereClause = {};
  
    if (status) {
      whereClause.status = status;
    }
  
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }
  
    if (associateId) {
      whereClause.associateId = associateId;
    }
  
    if (customerId) {
      whereClause.customerId = customerId;
    }
  
    try {
      const quotes = await Quote.findAll({
        where: whereClause,
        include: [
          {
            model: LineItem,
            as: 'items',
          },
        ],
      });
  
      res.json(quotes);
    } catch (error) {
      console.error('Error retrieving quotes:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;