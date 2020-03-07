const jwt = require('jsonwebtoken');

const service = {
    generateAccessToken: function (username) {
        return jwt.sign({name: username}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15minutes'});
    },

    generateRefreshToken: function (username) {
        const token = jwt.sign({name: username}, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30days'});
        const { exp } = jwt.decode(token);
        return {token: token, exp: exp};
    },

    generateVerificationToken: function (username) {
        return jwt.sign({name: username}, process.env.VERIFICATION_TOKEN_SECRET);
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