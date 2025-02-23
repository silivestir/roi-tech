const path = require('path');

const getAdvertPage = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'advert.html'));
};

module.exports = { getAdvertPage };