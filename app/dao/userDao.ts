import { HttpError } from '../util/httpError';
import { ResponseCode } from '../util/constant';

export const insertUser = async (db, user) => {
 try {
  await db.query('INSERT INTO users(username, password, email) VALUES($1, $2, $3)', [user.username, user.password, user.email]);
 } catch (error) {
  console.error(error);
  throw error;
 }
}

export const findUserByUsername = async (db, username) => {
 let res;
 try {
  res = await db.query('SELECT username, password, verified, role FROM users WHERE username LIKE $1', [username]);
  shouldHaveSingleRow(res);
 } catch (error) {
  console.error(error);
  throw error;
 }
 return res.rows[0];
}

export const findEmailByUsername = async (db, username) => {
 let res;
 try {
  res = await db.query('SELECT username, email FROM users WHERE username LIKE $1', [username]);
  shouldHaveSingleRow(res);
 } catch (error) {
  console.error(error);
  throw error;
 }
 return res.rows[0];
}

export const findEmailAndPasswordByUsername = async (db, username) => {
 let res;
 try {
  res = await db.query('SELECT username, email, password FROM users WHERE username LIKE $1', [username]);
 } catch (error) {
  console.error(error);
  throw error;
 }

 if (res.rows.length === 0) {
  let e = new Error('bad credentials') as HttpError;
  e.responseCode = ResponseCode.FORBIDDEN;
  throw e
 } else if (res.rows.length > 1) {
  console.error('ambiguous token');
  let e = new Error('internal server error') as HttpError;
  e.responseCode = ResponseCode.INTERNAL_SERVER_ERROR;
  throw e
 }

 return res.rows[0];
}

export const verifyUser = async (db, username) => {
 try {
  await db.query('UPDATE users SET verified = true WHERE username LIKE $1', [username]);
 } catch (error) {
  console.error(error);
  throw error;
 }
}

export const updateByUsername = async (db, user) => {
 try {
  await db.query('UPDATE users SET password =$1 WHERE username = $2', [user.password, user.username]);
 } catch (error) {
  console.error(error);
  throw error;
 }
}

const shouldHaveSingleRow = function (res) {

 if (res.rows.length === 0) {
  let e = new Error('user not found') as HttpError;
  e.responseCode = ResponseCode.BAD_REQUEST;
  throw e
 } else if (res.rows.length > 1) {
  console.error('ambiguous token');
  let e = new Error('internal server error') as HttpError;
  e.responseCode = ResponseCode.INTERNAL_SERVER_ERROR;
  throw e
 }
};
