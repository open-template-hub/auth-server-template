const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:true
});

async function query(text, params) {
    const start = Date.now();
    try {
        return await pool.query(text, params);
    } catch (e) {
        console.error(e);

        // https://www.postgresql.org/docs/10/errcodes-appendix.html
        if (e.code && e.code.startsWith('23')) {
            e.statusCode = 400;
        } else {
            e.statusCode = 500;
        }

        throw e;
    } finally {
        const duration = Date.now() - start;
        console.log('executed query', { text, duration });
    }
}

module.exports = {
    query: query
};