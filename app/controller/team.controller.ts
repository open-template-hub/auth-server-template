import {
  BusinessLogicActionType,
  Context,
  JoinTeamMailActionParams,
  MessageQueueChannelType,
  MessageQueueProvider,
  MongoDbProvider,
  NotificationParams,
  QueueMessage,
  TeamRole,
  TokenUtil
} from '@open-template-hub/common';
import { Environment } from '../../environment';
import { TeamRepository } from '../repository/team.repository';
import { UserRepository } from '../repository/user.repository';

export class TeamController {
  constructor(
      private environment = new Environment(),
      private tokenUtil: TokenUtil = new TokenUtil( environment.args() )
  ) {
    /** intentionally blank */
  }

  static getTeams = async (
      mongodb_provider: MongoDbProvider,
      username: string
  ) => {
    const teamRepository = await new TeamRepository().initialize(
        mongodb_provider.getConnection()
    );

    return teamRepository.getTeams(
        username
    );
  };

  create = async (
      context: Context,
      name: string,
      payload: any
  ) => {
    const teamRepository = await new TeamRepository().initialize(
        context.mongodb_provider.getConnection()
    );

    const team = await teamRepository.create(
        context.username,
        name,
        payload
    );

    const environment = new Environment();
    const tokenUtil = new TokenUtil( environment.args() );
    const tokens = tokenUtil.addTeamToToken( context.token, team._doc );

    return { tokens };
  };

  addMember = async (
    context: Context,
    origin: string,
    teamId: string,
    email: string | undefined,
    username: string | undefined,
    teamRole: TeamRole.READER | TeamRole.WRITER
  ) => {
       // check pre conditions
       if ( ( email && username ) || ( !email && !username ) ) {
        throw new Error( 'Either username or email should be given.' );
      }
  
      // init repositorires
      const teamRepository = await new TeamRepository().initialize(
          context.mongodb_provider.getConnection()
      );
      const userRepository = new UserRepository( context.postgresql_provider );
  
      const registeredUser = await userRepository.findUserByUsernameOrEmail( email ?? username as string, false );
  
      // if username is given, user must be registered
      if ( username && !registeredUser ) {
        throw new Error( `User not found with given username: ${ username }` );
      }
  
      // if the user is not be registered, email can not be null
      if ( !registeredUser && !email ) {
        throw new Error( `Email must be given for non registered users` );
      }
  
      // overwrite email or username if user is already registered
      if ( registeredUser ) {
        if ( !email ) {
          email = registeredUser.email;
        }
  
        if ( !username ) {
          username = registeredUser.username;
        }
      }
  
      // email should be string if passes the conditions above
      email = email as string;


      const team = await teamRepository.addMember(
        teamId,
        {
            username: username,
            email: email,
            isVerified: false,
            payload: { invitationdate: Date.now() }
        },
        teamRole
      )
  
      if ( !team ) {
        throw new Error( `Can not find the team with given teamId: ${ teamId } or user is already in the team` );
      }
  
      await this.sendTeamEmail(
          context.message_queue_provider,
          origin,
          {
            username: username,
            email: email
          },
          {
            teamId: team.team_id,
            teamRole: teamRole,
            teamName: team.name
          }
      );
  
      if ( username ) {
        let roleText: string;

        if ( teamRole === TeamRole.READER ) {
          roleText = 'reader';
        }
        else {
          roleText = 'writer';
        }

        await this.sendJoinTeamRequestNotificationToQueue(
            context.message_queue_provider,
            {
              timestamp: new Date().getTime(),
              username: username,
              message: `${ context.username } invited you to join ${ team.name } as ${ roleText }.`,
              sender: context.username,
              category: 'Team'
            }
        );
      }
  
      return team; 
  }

  removeMember = async (
    context: Context,
    teamId: string,
    email: string,
    teamRole: TeamRole.READER | TeamRole.WRITER
  ) => {
    const teamRepository = await new TeamRepository().initialize(
      context.mongodb_provider.getConnection()
    );

    const response = await teamRepository.removeMember(
      teamId,
      email,
      teamRole
    );

    return response;
  }

  verify = async (
      context: Context,
      token: string
  ) => {
    // decode token
    const environment = new Environment();
    const tokenUtil = new TokenUtil( environment.args() );
    const decodedToken = tokenUtil.verifyTeamToken( token ) as any;

    // get user from username
    const userRepository = new UserRepository( context.postgresql_provider );
    const tokenUser = await userRepository.findUserByUsernameOrEmail( context.username );

    // todo mert after common update change decodedToken.username with decodedToken.email
    if ( tokenUser.email !== decodedToken.username ) {
      throw new Error( 'Permisson denied' );
    }

    // verify
    const teamRepository = await new TeamRepository().initialize(
        context.mongodb_provider.getConnection()
    );

    await teamRepository.verify(
        tokenUser.username,
        tokenUser.email,
        decodedToken.team.id,
        decodedToken.team.role
    );
  };

  verifyTeamRequest = async (
    context: Context,
    teamId: string,
    teamRole: TeamRole.READER | TeamRole.WRITER
  ) => {
    const userRepository = new UserRepository( context.postgresql_provider );
    const user = await userRepository.findUserByUsernameOrEmail( context.username );

    const teamRepository = await new TeamRepository().initialize(
      context.mongodb_provider.getConnection()
    );

    const team = await teamRepository.verify(
      context.username,
      user.email,
      teamId,
      teamRole === TeamRole.READER ? 'readers' : 'writers'
    );

    const environment = new Environment();
    const tokenUtil = new TokenUtil( environment.args() );
    const tokens = tokenUtil.addTeamToToken( context.token, team );

    return { team, tokens }
  }

  deleteTeam = async (
      context: Context,
      teamId: string
  ) => {
    const teamRepository = await new TeamRepository().initialize(
        context.mongodb_provider.getConnection()
    );

    const team = await teamRepository.deleteTeam(
      teamId
    );

    const environment = new Environment();
    const tokenUtil = new TokenUtil( environment.args() );
    const tokens = tokenUtil.addTeamToToken( context.token, team );

    return { tokens, team };
  };

  private sendTeamEmail = async (
      messageQueueProvider: MessageQueueProvider,
      origin: string,
      targetUser: {
        username: string | undefined,
        email: string
      },
      targetTeam: {
        teamId: string,
        teamRole: TeamRole,
        teamName: string
      }
  ) => {
    const orchestrationChannelTag = this.environment.args().mqArgs?.orchestrationServerMessageQueueChannel;

    const joinTeamToken = this.tokenUtil.generateJoinTeamToken( targetUser.email, {
      id: targetTeam.teamId,
      role: targetTeam.teamRole
    } );

    const joinTeamParams = {
      user: targetUser.username,
      email: targetUser.email,
      joinTeamToken,
      teamId: targetTeam.teamId,
      teamName: targetTeam.teamName,
      joinTeamUrl: origin + '/join-team'
    } as JoinTeamMailActionParams;

    const message = {
      sender: MessageQueueChannelType.BUSINESS_LOGIC,
      receiver: MessageQueueChannelType.MAIL,
      message: {
        mailType: {
          joinTeam: {
            params: joinTeamParams
          }
        }
      }
    };

    await messageQueueProvider.publish(
        message,
        orchestrationChannelTag as string
    );
  };

  private async sendJoinTeamRequestNotificationToQueue(
      messageQueueProvider: MessageQueueProvider,
      notificationParams: NotificationParams
  ) {
    const orchestrationChannelTag = this.environment.args().mqArgs?.orchestrationServerMessageQueueChannel;

    const message = {
      sender: MessageQueueChannelType.AUTH,
      receiver: MessageQueueChannelType.BUSINESS_LOGIC,
      message: {
        notification: {
          params: notificationParams
        }
      } as BusinessLogicActionType
    } as QueueMessage;

    await messageQueueProvider.publish(
        message,
        orchestrationChannelTag as string
    );
  }
}
