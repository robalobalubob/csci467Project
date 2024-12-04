const express = require('express');
const router = express.Router();
const { User, Quote, LineItem, sequelize } = require('../models');
const { Op } = require('sequelize');

const validateAssociateData = (data, isUpdate = false) => {
  const { name, userId, password, address } = data;

  if (!isUpdate) {
    // For creation, all fields except address are required
    if (!name || !userId || !password) {
      return { status: 400, message: 'Name, userId, and password are required.' };
    }
  } else {
    // For updates, at least one field should be provided
    if (!name && !userId && !password && !address) {
      return { status: 400, message: 'At least one field (name, userId, password, address) must be provided for update.' };
    }
  }

  return null;
};

// Retrieve all sales associates
router.get('/associates', async (req, res) => {
  try {
    const associates = await User.findAll({
      attributes: { exclude: ['password'] },
    });
    res.json(associates);
  } catch (error) {
    console.error('Error retrieving associates:', error);
    res.status(500).json({ success: false, message: 'Server error while retrieving associates.' });
  }
});

// Retrieve a single sales associate by ID
router.get('/associates/:associateId', async (req, res) => {
  const { associateId } = req.params;
  try {
    const associate = await User.findByPk(associateId, {
      attributes: { exclude: ['password'] },
    });
    if (!associate) {
      return res.status(404).json({ success: false, message: 'Associate not found.' });
    }
    res.json(associate);
  } catch (error) {
    console.error('Error retrieving associate:', error);
    res.status(500).json({ success: false, message: 'Server error while retrieving the associate.' });
  }
});

// Create a new sales associate
router.post('/associates', async (req, res) => {
  const { name, userId, password, address } = req.body;

  const validationError = validateAssociateData(req.body);
  if (validationError) {
    return res.status(validationError.status).json({ success: false, message: validationError.message });
  }

  try {
    const newAssociate = await sequelize.transaction(async (transaction) => {
      // Check if userId already exists
      const existingUser = await User.findOne({
        where: { userId },
        transaction,
      });
      if (existingUser) {
        throw { status: 400, message: 'userId already exists. Please choose another.' };
      }

      // Create new associate
      const createdAssociate = await User.create({
        name,
        userId,
        password: password,
        address: address || null,
        accumulatedCommission: 0,
      }, { transaction });

      return createdAssociate;
    });

    // Exclude password from response
    const { password: _, ...associateData } = newAssociate.toJSON();

    res.status(201).json({ success: true, message: 'Associate created successfully.', associate: associateData });
  } catch (error) {
    console.error('Error creating associate:', error);
    if (error.status && error.message) {
      res.status(error.status).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Server error while creating the associate.' });
    }
  }
});

// Update an existing sales associate
router.put('/associates/:associateId', async (req, res) => {
  const { associateId } = req.params;
  const { name, userId, password, address } = req.body;

  // Validate associate data
  const validationError = validateAssociateData(req.body, true);
  if (validationError) {
    return res.status(validationError.status).json({ success: false, message: validationError.message });
  }

  try {
    const updatedAssociate = await sequelize.transaction(async (transaction) => {
      const associate = await User.findByPk(associateId, { transaction });

      if (!associate) {
        throw { status: 404, message: 'Associate not found.' };
      }

      // If userId is being updated, check for uniqueness
      if (userId && userId !== associate.userId) {
        const existingUser = await User.findOne({
          where: { userId },
          transaction,
        });
        if (existingUser) {
          throw { status: 400, message: 'userId already exists. Please choose another.' };
        }
      }

      // Prepare update data
      const updateData = {};
      if (name) updateData.name = name;
      if (userId) updateData.userId = userId;
      if (address !== undefined) updateData.address = address;
      if (password) updateData.password = password;

      // Update associate
      await associate.update(updateData, { transaction });

      return associate;
    });

    // Exclude password from response
    const { password: _, ...associateData } = updatedAssociate.toJSON();

    res.json({ success: true, message: 'Associate updated successfully.', associate: associateData });
  } catch (error) {
    console.error('Error updating associate:', error);
    if (error.status && error.message) {
      res.status(error.status).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Server error while updating the associate.' });
    }
  }
});

// Delete a sales associate
router.delete('/associates/:associateId', async (req, res) => {
  const { associateId } = req.params;

  try {
    await sequelize.transaction(async (transaction) => {
      const associate = await User.findByPk(associateId, { transaction });

      if (!associate) {
        throw { status: 404, message: 'Associate not found.' };
      }

      // Check if associate has any related quotes
      const relatedQuotesCount = await Quote.count({
        where: { associateId },
        transaction,
      });

      if (relatedQuotesCount > 0) {
        throw { status: 400, message: 'Cannot delete associate with existing quotes.' };
      }

      // Delete associate
      await associate.destroy({ transaction });
    });

    res.json({ success: true, message: 'Associate deleted successfully.' });
  } catch (error) {
    console.error('Error deleting associate:', error);
    if (error.status && error.message) {
      res.status(error.status).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Server error while deleting the associate.' });
    }
  }
});

// Search and view quotes based on filters
router.get('/quotes', async (req, res) => {
  const { status, startDate, endDate, associateId, customerId } = req.query;

  const whereClause = {};

  if (status) {
    whereClause.status = status;
  }

  if (startDate) {
    whereClause.createdAt = {
      ...(whereClause.createdAt || {}),
      [Op.gte]: new Date(startDate),
    };
  }

  if (endDate) {
    whereClause.createdAt = {
      ...(whereClause.createdAt || {}),
      [Op.lte]: new Date(endDate),
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
    res.status(500).json({ success: false, message: 'Server error while retrieving quotes.' });
  }
});

module.exports = router;