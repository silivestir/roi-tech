// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { toggleAdminRole } = require('../controllers/updateStatus');
///const authMiddleware = require('../middleware/authMiddleware'); // Optional: For authentication

// Protect the route with authentication middleware (optional)
router.post('/:userId/toggle-admin', toggleAdminRole);

module.exports = router;