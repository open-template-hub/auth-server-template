import { TokenUtil } from '../util/token.util';
import { UserRepository } from '../repository/user.repository';

export class InfoController {
  me = async (db, token) => {
    const tokenUtil = new TokenUtil();
    const user = await tokenUtil.verifyAccessToken(token);

    const userRepository = new UserRepository(db);
    return await userRepository.findEmailByUsername(user.username);
  };
}
