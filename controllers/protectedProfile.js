const path = require('path');

const getProfile = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'profile.html'));
};

module.exports = { getProfile };