const util = {
    envVariablesCheck: function () {
        let valid = true;

        if (!process.env.ACCESS_TOKEN_SECRET) {
            console.error('Please define process.env.ACCESS_TOKEN_SECRET');
            valid = false;
        }

        if (!process.env.REFRESH_TOKEN_SECRET) {
            console.error('Please define process.env.REFRESH_TOKEN_SECRET');
            valid = false;
        }

        if (!process.env.DATABASE_URL) {
            console.error('Please define process.env.DATABASE_URL');
            valid = false;
        }

        return valid;
    }
};

module.exports = util;