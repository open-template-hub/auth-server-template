const db = require('./db');

const shouldHaveSingleRow = function (res) {
    if (res.rows.length === 0) {
        let error = new Error();
        error.detail = "Bad credentials";
        error.statusCode = 403;
        throw error;
    } else if (res.rows.length > 1) {
        console.error('Ambiguous username');
        let error = new Error();
        error.detail = "Internal server error";
        error.statusCode = 500;
        throw error;
    }
};

const dao = {
    insertUser: async (user) => {
        try {
            await db.query('INSERT INTO users(username, password, email) VALUES($1, $2, $3)', [user.username, user.password, user.email]);
        } catch (e) {
            throw e;
        }
    },
    findUserByUsername: async (username) => {
        let res;
        try {
            res = await db.query('SELECT username, password, verified, role FROM users WHERE username LIKE $1', [username]);
            shouldHaveSingleRow(res);
        } catch (e) {
            throw e;
        }

        return res.rows[0];
    },

    findEmailAndPasswordByUsername: async (username) => {
        let res;
        try {
            res = await db.query('SELECT username, email, password FROM users WHERE username LIKE $1', [username]);
            shouldHaveSingleRow(res);
        } catch (e) {
            throw e;
        }

        return res.rows[0];
    },

    verifyUser: async (username) => {
        try {
            await db.query('UPDATE users SET verified = true WHERE username LIKE $1', [username]);
        } catch (e) {
            throw e;
        }
    },

    updateByUsername: async (user) => {
        try {
            await db.query('UPDATE users SET password =$1 WHERE username = $2', [user.password, user.username]);
        } catch (e) {
            throw e;
        }
    }
};

module.exports = dao;