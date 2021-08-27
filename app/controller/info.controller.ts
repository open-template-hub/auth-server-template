import { PostgreSqlProvider, TokenUtil } from '@open-template-hub/common';
import { Environment } from '../../environment';
import { UserRepository } from '../repository/user.repository';

export class InfoController {
  /**
   * gets user details by token
   * @param db database
   * @param token token
   */
  me = async ( db: PostgreSqlProvider, token: string ) => {
    const environment = new Environment();
    const tokenUtil = new TokenUtil( environment.args() );
    const user: any = tokenUtil.verifyAccessToken( token );

    const userRepository = new UserRepository( db );
    return userRepository.findEmailByUsername( user.username );
  };
}
