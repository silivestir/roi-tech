const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("./../models/userModel");
const jwt = require("jsonwebtoken");

// Hardcoded JWT secret (use environment variable for production)
const JWT_SECRET = "mySuperSecretKey123"; // Replace with process.env.JWT_SECRET for production

// Login route (POST)
router.route('/').post(async(req, res) => {
    try {
        const { email, password } = req.body; // Destructure email and password from the request body

        //  console.log(email); // Log the email for debugging purposes

        // Find the user by email
        const user = await User.findOne({ where: { email } });

        console.log('User found:', user); // Log the user details for debugging purposes

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check if the password matches using bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Create a JWT token with the user's id, email, and username
        const token = jwt.sign({ id: user.id, email: user.email, username: user.username, isAdmin: user.isAdmin },
            JWT_SECRET, // Use the same secret key
            { expiresIn: '1h' } // Set token expiration time (1 hour)
        );

        // Send the token as an HTTP-only cookie (recommended for security)
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 3600000 }); // 1 hour expiration

        // Return user info (excluding password)
        res.status(200).json({
            message: 'Login successful',
            user: {
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                isAdmin: user.isAdmin,
                isStaff: user.isStaff
            },
            token: token,
        });

    } catch (error) {
        console.error('Login error:', error); // Log error details for debugging
        res.status(500).json({ error: error.message, details: error.message }); // Send error message to client
    }
});

module.exports = router;