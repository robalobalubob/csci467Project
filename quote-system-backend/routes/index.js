const express = require('express');
const router = express.Router();

const userRoutes = require('./users');
const quoteRoutes = require('./quotes');
const lineItemRoutes = require('./lineItems');

// Define Routes
router.use('/users', userRoutes);
router.use('/quotes', quoteRoutes);
router.use('/line-items', lineItemRoutes);

module.exports = router;