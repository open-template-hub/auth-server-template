const db = require('./db');

const shouldHaveSingleRow = function (res) {

 if (res.rows.length === 0) {
  let e = new Error("user not found");
  e.responseCode = 400;
  throw e
 } else if (res.rows.length > 1) {
  console.error('ambiguous token');
  let e = new Error("internal server error");
  e.responseCode = 500;
  throw e
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

 findEmailByUsername: async (username) => {
  let res;
  try {
   res = await db.query('SELECT username, email FROM users WHERE username LIKE $1', [username]);
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

   if (res.rows.length === 0) {
    let e = new Error("bad credentials");
    e.responseCode = 403;
    throw e
   } else if (res.rows.length > 1) {
    console.error('ambiguous token');
    let e = new Error("internal server error");
    e.responseCode = 500;
    throw e
   }
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
