const express = require('express');
const router = express.Router();
const { LegacyCustomer } = require('../models');

router.get('/:customerId', async (req, res) => {
  const { customerId } = req.params;

  try {
    const customer = await LegacyCustomer.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Error retrieving customer:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;