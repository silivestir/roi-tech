const jwt = require('jsonwebtoken');
const path = require('path')
const authenticateJWT = (req, res, next) => {
    const token = req.cookies.token; // Try to get token from cookies or authorization header
    //console.log(token)
    if (!token) {
        const filePath = path.join(__dirname, '../views', 'notlogedin.html');
        res.sendFile(filePath);
    }

    const JWT_SECRET = "mySuperSecretKey123";

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).sendFile(path.join(__dirname, '../views/notlogedin.html'));
        }

        req.user = user; // Store user information in the request object
        next(); // Proceed to the next middleware/route handler
    });
};

module.exports = authenticateJWT;