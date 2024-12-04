const express = require('express');
const router = express.Router();
const { User } = require('../models');

router.post('/login', async (req, res) => {
  const { user_id, password } = req.body;

  try {
    const user = await User.findOne({
      where: {
        userId: user_id,
        password: password,
      },
    });

    if (user) {
      res.json({
        success: true,
        user_id: user.userId,
        associate_id: user.associateId,
        name: user.name,
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error during authentication:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;