import { verifyAccessToken } from './token.service';
import { UserRepository } from '../repository/user.repository';

export const me = async (db, token) => {
  const user = await verifyAccessToken(token);

  const userRepository = new UserRepository(db);
  return await userRepository.findEmailByUsername(user.username);
};
