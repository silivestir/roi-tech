const Feedback = require('../models/feedbackModel');

const nodemailer = require('nodemailer');
// Import the transporter

// Set up the transporter using your email service provider's SMTP settings
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can replace this with any email service you want
    auth: {
        user: "silvestiriassey@gmail.com", // Hardcoded email user
        pass: "urzt ftqf caxa rhwk" // Your email password or app-specific password
    }
});

exports.createFeedback = async(req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Save the feedback to the database
        const feedback = await Feedback.create({
            name,
            email,
            subject,
            message
        });

        // Send the confirmation email using Nodemailer
        const mailOptions = {
            from: '"ROITECHEDUCATION SOLUTIONS"<silvestiriassey@gmail.com>', // Your email address (same as configured in transporter)
            to: email, // Recipient's email (user's email from the form)
            subject: 'We Received Your Feedback',
            text: `Hello ${name},\n\nThank you for reaching out! We have received your feedback, and our team will get back to you as soon as possible.\n\nWe appreciate your patience.\n\nBest regards,\nYour Support Team`
        };

        // Send email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending confirmation email:', error);
            } else {
                console.log('Confirmation email sent: ' + info.response);
            }
        });

        // Send a response to the client
        return res.status(201).json({ message: "Feedback submitted successfully! A confirmation email has been sent to you.", feedback });
    } catch (error) {
        console.error("Error saving feedback:", error);
        return res.status(500).json({ message: "Failed to submit feedback" });
    }
};




/**
 *
 * 
 * 

module.exports = transporter;
 * 
 * */