const User = require('../models/userModel'); // Assuming you have a User model

const toggleAdminRole = async(req, res) => {
    const { userId } = req.params;
    //console.log(userId)
    try {
        // Find the user by ID
        const user = await User.findByPk(userId);

        // const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Toggle the admin role
        user.isAdmin = !user.isAdmin;
        await user.save();

        res.status(200).json({ message: 'Admin role toggled successfully', user });
    } catch (error) {
        console.error('Error toggling admin role:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { toggleAdminRole };