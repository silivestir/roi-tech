const path = require('path');

const getHomepage = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'homepage.html'));
};

module.exports = { getHomepage };