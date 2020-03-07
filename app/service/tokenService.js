const jwt = require('jsonwebtoken');

const service = {
    generateAccessToken: function (user) {
        return jwt.sign({username: user.username, role: user.role}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15minutes'});
    },

    generateRefreshToken: function (user) {
        const token = jwt.sign({username: user.username, role: user.role}, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30days'});
        const { exp } = jwt.decode(token);
        return {token: token, exp: exp};
    },

    generateVerificationToken: function (user) {
        return jwt.sign({username: user.username}, process.env.VERIFICATION_TOKEN_SECRET);
    },

    verifyVerificationToken: function (token) {
        try {
            return jwt.verify(token, process.env.VERIFICATION_TOKEN_SECRET);
        } catch (e) {
            e.statusCode = 403;
            throw e;
        }
    },

    verifyRefreshToken: function (token) {
        try {
            return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        } catch (e) {
            e.statusCode = 403;
            throw e;
        }
    }
};

module.exports = service;