const path = require('path');

const getRealTimeEditor = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'profile.html'));
};

module.exports = { getRealTimeEditor };