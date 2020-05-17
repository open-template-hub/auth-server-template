const tokenService = require('../service/tokenService.js');
const userDao = require('../dao/userDao');

const service = {

    me: async (token) => {
        try {
            const user = await tokenService.verifyAccessToken(token);
            return await userDao.findEmailByUsername(user.username);
        } catch (e) {
            throw e
        }
    }
};

module.exports = service;