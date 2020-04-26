const { Pool } = require('pg');
const builder = require('../util/builder');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    }
});

const preloadTablesTemplatePath = "./assets/preloadTables.psql";

async function preload() {
    let tables = builder.buildTemplate(preloadTablesTemplatePath);
    return query(tables);
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