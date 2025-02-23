const Course = require('../models/post');
//const sequelize = require('./../config/dbConf');
const User = require('../models/userModel');

const Enrollment = require('../models/enrollment');


//fetch data from  database use then in  here  
// find  user  where  user will  be  registered  as payed  user 




//function to verify the payment token (replace with actual verification logic)
const verifyPaymentToken = async(paymentToken) => {
    // For now, simulate token verification (replace this with actual logic)
    return true;
    //paymentToken === 333333; // Replace this with real logic


};

// Controller to handle payment token verification and enrollment
const verifyPaymentTokenAndEnroll = async(req, res) => {
    const { userId, courseId, paymentToken } = req.body;

    try {

        const isValid = await verifyPaymentToken(paymentToken);
        console.log(isValid)
        if (!isValid) {
            return res.status(400).json({ error: 'Invalid payment token.' });
        }


        const enrollment = await Enrollment.create({
            userId,
            courseId,
            paymentStatus: 'Verified',
            paymentToken,
        });

        return res.json({ message: 'Enrollment successful!', enrollment });
    } catch (error) {
        console.error('Error during payment verification or enrollment:', error);
        return res.status(500).json({ error: 'An error occurred during enrollment.' });
    }
};

module.exports = {
    verifyPaymentTokenAndEnroll,
};