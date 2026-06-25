const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
    // The token will expire in 30 days
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

module.exports = generateToken;