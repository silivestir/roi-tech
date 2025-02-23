const path = require('path');

const getPdfy = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'pdfy.html'));
};

module.exports = { getPdfy };