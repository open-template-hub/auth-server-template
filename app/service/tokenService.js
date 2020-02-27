const jwt = require('jsonwebtoken');

const service = {
    generateAccessToken: function (username) {
        return jwt.sign({name: username}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15minutes'});
    },

    generateRefreshToken: function (username) {
        return jwt.sign({name: username}, process.env.REFRESH_TOKEN_SECRET);
    },

    verifyRefreshToken: function (refreshToken) {
        try {
            return jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        } catch (e) {
            e.statusCode = 403;
            throw e;
        }
    }
};

module.exports = service;