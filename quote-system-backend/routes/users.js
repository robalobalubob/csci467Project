const express = require('express');
const router = express.Router();
const { User } = require('../models');

// Create a new user
router.post('/', async (req, res) => {
    try {
      const { name, userId, password, address } = req.body;
      const newUser = await User.create({ name, userId, password, address });
      res.status(201).json(newUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all users
router.get('/', async (req, res) => {
    try {
      const users = await User.findAll();
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

// Get a single user by ID
router.get('/:id', async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

// Update a user by ID
router.put('/:id', async (req, res) => {
    try {
      const { name, userId, password, address } = req.body;
      const user = await User.findByPk(req.params.id);
      if (user) {
        await user.update({ name, userId, password, address });
        res.status(200).json(user);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a user by ID
router.delete('/:id', async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (user) {
        await user.destroy();
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
});
  
module.exports = router;