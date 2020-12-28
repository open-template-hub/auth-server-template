import { TokenUtil } from '../util/token.util';
/**
 * @description holds info controller
 */

import { UserRepository } from '../repository/user.repository';
import { PostgreSqlProvider } from '../provider/postgre.provider';
import { User } from '../interface/user.interface';

export class InfoController {
  /**
   * gets user details by token
   * @param db database
   * @param token token
   */
  me = async (db: PostgreSqlProvider, token: string) => {
    const tokenUtil = new TokenUtil();
    const user = tokenUtil.verifyAccessToken(token) as User;

    const userRepository = new UserRepository(db);
    return await userRepository.findEmailByUsername(user.username);
  };
}
