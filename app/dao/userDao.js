const db = require('./db');

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
        } catch (e) {
            throw e;
        }

        if (res.rows.length === 0) {
            let error = new Error();
            error.statusCode = 403;
            throw error
        } else if (res.rows.length > 1) {
            console.error('Ambiguous username');
            let error = new Error();
            error.statusCode = 500;
            throw error
        }

        return res.rows[0];
    },

    verifyUser: async (username) => {
        try {
            await db.query('UPDATE users SET verified = true WHERE username LIKE $1', [username]);
        } catch (e) {
            throw e;
        }
    }
};

module.exports = dao;