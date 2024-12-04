const express = require('express');
const router = express.Router();

const userRoutes = require('./users');
const quoteRoutes = require('./quotes');
const lineItemRoutes = require('./lineItems');
const customerRoutes = require('./customers');

router.use('/users', userRoutes);
router.use('/quotes', quoteRoutes);
router.use('/line-items', lineItemRoutes);
router.use('/customers', customerRoutes);

module.exports = router;