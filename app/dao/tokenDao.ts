import { HttpError } from '../util/httpError';
import { ResponseCode } from '../util/constant';

export const insertToken = async (db, token) => {
 let res;
 try {
  res = await db.query('INSERT INTO tokens(token, expire_date) VALUES($1, $2)',
   [token.token, token.expireAt]);
 } catch (error) {
  console.error(error);
  throw error;
 }
 return res.rows[0];
}

export const deleteToken = async (db, token) => {
 let res;
 try {
  res = await db.query('DELETE FROM tokens WHERE token LIKE $1',
   [token]);
 } catch (error) {
  console.error(error);
  throw error;
 }
 return res.rows[0];
}

export const findToken = async (db, token) => {
 let res;
 try {
  res = await db.query('SELECT token FROM tokens WHERE token LIKE $1',
   [token]);
 } catch (error) {
  console.error(error);
  throw error;
 }

 if (res.rows.length === 0) {
  let e = new Error('invalid token') as HttpError;
  e.responseCode = ResponseCode.UNAUTHORIZED;
  throw e
 } else if (res.rows.length > 1) {
  console.error('ambiguous token');
  let e = new Error('internal server error') as HttpError;
  e.responseCode = ResponseCode.INTERNAL_SERVER_ERROR;
  throw e
 }

 return res.rows[0];
}

export const deleteExpiredTokens = async (db) => {
 let res;
 try {
  res = await db.query('DELETE FROM tokens WHERE expire_date < (now() at time zone \'utc\')');
 } catch (error) {
  console.error(error);
  throw error;
 }
 return res.rows[0];
}
