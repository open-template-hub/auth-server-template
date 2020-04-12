const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    }
});

const preloadTables = "CREATE TABLE IF NOT EXISTS users"
                    + " (username text NOT NULL, password text NOT NULL,"
                    + " email text NOT NULL, verified boolean, role text);"
                    + " CREATE TABLE IF NOT EXISTS tokens"
                    + " (token text NOT NULL, expire_date date);"

async function preload() {
    return query(preloadTables);
}

async function query(text, params) {
    const start = Date.now();
    try {
        return await pool.query(text, params);
    } catch (e) {
        console.error(e);

        // https://www.postgresql.org/docs/10/errcodes-appendix.html
        if (e.code && e.code.startsWith('23')) {
            e.responseCode = 400;
        } else {
            e.responseCode = 500;
        }

        throw e;
    } finally {
        const duration = Date.now() - start;
        console.log('executed query', { text, duration });
    }
}

module.exports = {
    query: query,
    preload: preload
};