const express = require('express');
const router = express.Router();

// Import the controller
const { verifyPaymentTokenAndEnroll } = require('../controllers/enrollmentController');

// Define the route for verifying payment token and enrolling
router.post('/', verifyPaymentTokenAndEnroll);

module.exports = router;