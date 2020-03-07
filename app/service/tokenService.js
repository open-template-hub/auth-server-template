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

    verifyAccessToken: function (refreshToken) {
        try {
            return jwt.verify(refreshToken, process.env.ACCESS_TOKEN_SECRET);
        } catch (e) {
            e.statusCode = 403;
            throw e;
        }
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