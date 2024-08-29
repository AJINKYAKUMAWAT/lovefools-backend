const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']; // Get the token from the Authorization header
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (token == null) return res.sendStatus(403); // If no token is present, return forbidden

    jwt.verify(token, process.env.secretKey, (err, user) => {
        if (err) return res.sendStatus(403); // If token is invalid, return forbidden
        req.user = user; // Attach the user object to the request
        next(); // Pass the execution to the next middleware or route
    });
}

module.exports = authenticateToken;
