const db = require('./db');

const dao = {
 insertToken: async (token) => {
  try {
   await db.query('INSERT INTO tokens(token, expire_date) VALUES($1, $2)', [token.token, token.expireAt]);
  } catch (e) {
   throw e;
  }
 },
 deleteToken: async (token) => {
  try {
   await db.query('DELETE FROM tokens WHERE token LIKE $1', [token]);
  } catch (e) {
   throw e;
  }
 },
 findToken: async (token) => {
  let res;
  try {
   res = await db.query('SELECT token FROM tokens WHERE token LIKE $1', [token]);
  } catch (e) {
   throw e;
  }

  if (res.rows.length === 0) {
   let e = new Error("invalid token");
   e.responseCode = 401;
   throw e
  } else if (res.rows.length > 1) {
   console.error('ambiguous token');
   let e = new Error("internal server error");
   e.responseCode = 500;
   throw e
  }

  return res.rows[0];
 },
 deleteExpiredTokens: async () => {
  try {
   await db.query('DELETE FROM tokens WHERE expire_date < (now() at time zone \'utc\')');
  } catch (e) {
   console.error(e);
  }
 }
};

module.exports = dao;
