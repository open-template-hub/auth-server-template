const bcrypt = require('bcrypt');

const tokenService = require('../service/tokenService.js');
const userDao = require('../dao/userDao');
const tokenDao = require('../dao/tokenDao');

const service = {
    signup: async (user) => {
        try {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            await userDao.insertUser({username: user.username, password: hashedPassword});
        } catch (e) {
            throw e
        }
    },

    login: async (user) => {
        let dbUser = {password: ''};
        try {
            dbUser = await userDao.findUserByUsername(user.username);
        } catch (e) {
            throw e
        }

        if (!await bcrypt.compare(user.password, dbUser.password)) {
            let error = new Error();
            error.statusCode = 403;
            throw error;
        }

        const accessToken = tokenService.generateAccessToken(dbUser.username);
        const refreshToken = tokenService.generateRefreshToken(dbUser.username);

        try {
            await tokenDao.insertToken({token:refreshToken, expireAt: new Date(Date.now() + (1000*60*60*24*30))});
        } catch (e) {
            throw e
        }

        return {accessToken: accessToken, refreshToken: refreshToken};
    },

    logout: async (token) => {
        try {
            await tokenDao.deleteToken(token);
        } catch (e) {
            throw e
        }
    },

    token: async (token) => {
        try {
            await tokenDao.findToken(token);
            const user = await tokenService.verifyRefreshToken(token);
            return tokenService.generateAccessToken(user.name);
        } catch (e) {
            throw e
        }
    },
};

module.exports = service;