const express = require('express');
const router = express.Router();
const getFeedBackController = require('../controllers/getFeedBackController');

// POST route for submitting feedback
//router.post('/usersFeedback', feedbackController.createFeedback);

// GET route for fetching feedback messages
router.get('/', getFeedBackController.getFeedback);

module.exports = router;