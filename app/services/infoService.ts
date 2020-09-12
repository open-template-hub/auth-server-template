import { findEmailByUsername } from '../dao/userDao';
import { verifyAccessToken } from './tokenService';

export const me = async (db, token) => {
 const user = await verifyAccessToken(token);
 return await findEmailByUsername(db, user.username);
}
