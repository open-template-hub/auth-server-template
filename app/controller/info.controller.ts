/**
 * @description holds info controller
 */

import { UserRepository } from '../repository/user.repository';
import { PostgreSqlProvider, TokenUtil, User } from '@open-template-hub/common';
import { Environment } from '../../environment';

export class InfoController {
  /**
   * gets user details by token
   * @param db database
   * @param token token
   */
  me = async (db: PostgreSqlProvider, token: string) => {
    const environment = new Environment();
    const tokenUtil = new TokenUtil(environment.args());
    const user = tokenUtil.verifyAccessToken(token) as User;

    const userRepository = new UserRepository(db);
    return await userRepository.findEmailByUsername(user.username);
  };
}
