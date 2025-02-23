const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// POST route for submitting feedback
router.post('/', feedbackController.createFeedback);

module.exports = router;