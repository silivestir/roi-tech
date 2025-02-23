const Feedback = require('../models/feedbackModel');



exports.getFeedback = async(req, res) => {
    try {
        // Retrieve all feedback from the database
        const feedbacks = await Feedback.findAll({});

        // Send the feedback data as a response
        return res.status(200).json({ feedbacks });
    } catch (error) {
        console.error("Error fetching feedback:", error);
        return res.status(500).json({ message: "Failed to fetch feedback" });
    }
};