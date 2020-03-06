const db = require('./db');

const dao = {
    insertUser: async (user) => {
        try {
            await db.query('INSERT INTO users(username, password) VALUES($1, $2)', [user.username, user.password]);
        } catch (e) {
            throw e;
        }
    },
    findUserByUsername: async (username) => {
        let res;
        try {
            res = await db.query('SELECT username, password FROM users WHERE username LIKE $1', [username]);
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
    }
};

module.exports = dao;