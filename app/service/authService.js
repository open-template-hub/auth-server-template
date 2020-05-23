const bcrypt = require('bcrypt');

const tokenService = require('../service/tokenService.js');
const mailService = require('../service/mailService.js');
const userDao = require('../dao/userDao');
const tokenDao = require('../dao/tokenDao');

const service = {
    signup: async (user) => {
        try {
            if (!user.password || !user.username || !user.email) {
                let e = new Error("username, password and email required");
                e.responseCode = 400;
                console.error(e);
                throw e;
            }

            const hashedPassword = await bcrypt.hash(user.password, 10);
            await userDao.insertUser({username: user.username, password: hashedPassword, email: user.email});

            const verificationToken = tokenService.generateVerificationToken(user);
            await mailService.sendAccountVerificationMail(user, verificationToken);
        } catch (e) {
            throw e
        }
    },

    login: async (user) => {
        try {
            if (!user.password || !user.username) {
                let e = new Error("username and password required");
                e.responseCode = 400;
                throw e;
            }
        } catch (e) {
            throw e
        }

        let dbUser = {password: '', verified: false};
        try {
            dbUser = await userDao.findUserByUsername(user.username);
        } catch (e) {
            throw e
        }

        if (!await bcrypt.compare(user.password, dbUser.password)) {
            let e = new Error("Bad credentials");
            e.responseCode = 403;
            throw e;
        }

        if (!dbUser.verified) {
            let e = new Error("Account not verified");
            e.responseCode = 403;
            throw e;
        }

        return await service.generateTokens(dbUser);
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
            return tokenService.generateAccessToken(user);
        } catch (e) {
            throw e
        }
    },

    verify: async (token) => {
        try {
            const user = await tokenService.verifyVerificationToken(token);
            await userDao.verifyUser(user.username);
        } catch (e) {
            throw e
        }
    },

    forgetPassword: async (username) => {
        try {
            const user = await userDao.findEmailAndPasswordByUsername(username);
            const passwordResetToken = tokenService.generatePasswordResetToken(user);
            await mailService.sendPasswordResetMail(user, passwordResetToken);
        } catch (e) {
            throw e
        }
    },

    resetPassword: async (user, token) => {
        try {
            if (!user.password || !user.username) {
                let e = new Error("username and password required");
                e.responseCode = 400;
                throw e;
            }

            user.password = await bcrypt.hash(user.password, 10);

            const dbUser = await userDao.findEmailAndPasswordByUsername(user.username);
            await tokenService.verifyPasswordResetToken(token, dbUser.password);
            await userDao.updateByUsername(user);
        } catch (e) {
            throw e
        }
    },

    generateTokens: async(user) => {
        const accessToken = tokenService.generateAccessToken(user);
        const refreshToken = tokenService.generateRefreshToken(user);

        try {
            await tokenDao.insertToken({token:refreshToken.token, expireAt: new Date(refreshToken.exp * 1000)});
        } catch (e) {
            throw e
        }

        return {accessToken: accessToken, refreshToken: refreshToken.token};
    }
};

module.exports = service;
