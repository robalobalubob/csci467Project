const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

module.exports = transporter;