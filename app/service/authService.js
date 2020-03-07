const bcrypt = require('bcrypt');

const tokenService = require('../service/tokenService.js');
const mailService = require('../service/mailService.js');
const userDao = require('../dao/userDao');
const tokenDao = require('../dao/tokenDao');

const service = {
    signup: async (user, host) => {
        try {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            await userDao.insertUser({username: user.username, password: hashedPassword, email: user.email});

            const verificationToken = tokenService.generateVerificationToken(user.username);
            await mailService.sendAccountVerificationMail(host, user.email, verificationToken);
        } catch (e) {
            throw e
        }
    },

    login: async (user) => {
        let dbUser = {password: '', verified: false};
        try {
            dbUser = await userDao.findUserByUsername(user.username);
        } catch (e) {
            throw e
        }

        if (!await bcrypt.compare(user.password, dbUser.password)) {
            let error = new Error();
            error.detail = "Bad credentials";
            error.statusCode = 403;
            throw error;
        }

        if (!dbUser.verified) {
            let error = new Error();
            error.detail = "Account not verified";
            error.statusCode = 403;
            throw error;
        }

        const accessToken = tokenService.generateAccessToken(dbUser.username);
        const refreshToken = tokenService.generateRefreshToken(dbUser.username);

        try {
            await tokenDao.insertToken({token:refreshToken.token, expireAt: new Date(refreshToken.exp * 1000)});
        } catch (e) {
            throw e
        }

        return {accessToken: accessToken, refreshToken: refreshToken.token};
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

    verify: async (token) => {
        try {
            const user = await tokenService.verifyVerificationToken(token);
            await userDao.verifyUser(user.name);
        } catch (e) {
            throw e
        }
    }
};

module.exports = service;