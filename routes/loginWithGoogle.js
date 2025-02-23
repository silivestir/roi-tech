const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel"); // Adjust as needed
const router = express.Router();

// Hardcoded JWT secret (use environment variable for production)
const JWT_SECRET = "mySuperSecretKey123"; // Replace with process.env.JWT_SECRET for production

// Google OAuth credentials from your Google Developer Console
const CLIENT_ID = '82818119582-l807jioq19dck1a46iqljltoktfh1l5l.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://roitechsolution.onrender.com/homepage'; // Your redirect URI for Render

//rmoving cookies t create  few minutes  session
router.use(cookieSession({
    name: 'session',
    keys: ['secretKey'],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Initialize Passport
router.use(passport.initialize());
//router.use(passport.session());

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: REDIRECT_URI,
}, async(accessToken, refreshToken, profile, done) => {
    try {
        // Check if the user already exists in your database
        let user = await User.findOne({ where: { email: profile.email } });
        if (!user) {
            // If the user doesn't exist, create a new user (you can adjust this as needed)
            user = await User.create({
                email: profile.email,
                username: profile.displayName,
                firstName: profile.given_name,
                lastName: profile.family_name,
                isAdmin: false, // Set as per your logic
                isStaff: false // Set as per your logic
            });
        }

        // Return user profile
        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async(id, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Route to initiate Google OAuth login
router.get('/login', passport.authenticate('google', {
    scope: ['email', 'profile']
}));

// Callback route for Google to redirect to after successful login
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    // Successful login, create JWT token and send response
    const token = jwt.sign({
        id: req.user.id,
        email: req.user.email,
        username: req.user.username,
        isAdmin: req.user.isAdmin,
    }, JWT_SECRET, { expiresIn: '1h' });

    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 3600000 }); // 1 hour expiration

    res.status(200).json({
        message: 'Google login successful',
        user: req.user,
        token: token
    });
});

// Existing login route (email and password)
router.post('/', async(req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({
            id: user.id,
            email: user.email,
            username: user.username,
            isAdmin: user.isAdmin,
        }, JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 3600000 });

        res.status(200).json({
            message: 'Login successful',
            user: { username: user.username, email: user.email },
            token: token,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;