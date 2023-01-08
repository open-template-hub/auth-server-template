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
  }

  addWriter = async (
      context: Context,
      origin: string,
      teamId: string,
      writerEmail: string | undefined,
      writerUsername: string | undefined
  ) => {
    // check pre conditions
    if ( ( writerEmail && writerUsername ) || ( !writerEmail && !writerUsername ) ) {
      throw new Error("Either username or email should be given.")
    }

    // init repositorires
    const teamRepository = await new TeamRepository().initialize(
        context.mongodb_provider.getConnection()
    );
    const userRepository = new UserRepository( context.postgresql_provider );

    const registeredUser = await userRepository.findUserByUsernameOrEmail( writerEmail ?? writerUsername as string, false );

    // if username is given, user must be registered
    if ( writerUsername && !registeredUser) {
      throw new Error( `User not found with given username: ${ writerUsername }` );
    }

    // if the user is not be registered, email can not be null
    if ( !registeredUser && !writerEmail ) {
      throw new Error( `Email must be given for non registered users`)
    }

    // overwrite email or username if user is already registered
    if ( registeredUser ) {
      if ( !writerEmail ) {
        writerEmail = registeredUser.email
      }

      if ( !writerUsername ) {
        writerUsername = registeredUser.username
      }
    }

    // email should be string if passes the conditions above
    writerEmail = writerEmail as string;

    const team = await teamRepository.addWriter(
        teamId,
        {
          username: writerUsername,
          email: writerEmail,
          isVerified: false,
          payload: { invitationDate: Date.now() }
        }
    );

    if ( !team ) {
      throw new Error(`Can not find the team with given teamId: ${ teamId } or user is already in the team`)
    }

    await this.sendTeamEmail(
      context.message_queue_provider,
      origin,
      {
        username: writerUsername,
        email: writerEmail
      },
      {
        teamId: team.team_id,
        teamRole: TeamRole.WRITER,
        teamName: team.name
      }
    )

    if ( writerUsername ) {
      await this.sendJoinTeamRequestNotificationToQueue(
        context.message_queue_provider,
        {
          timestamp: new Date().getTime(),
          username: writerUsername,
          message: `${context.username} invited you to join ${team.name} as writer.`,
          sender: context.username,
          category: 'Team'
        }
      ); 
    }
    
    return { writerUsername, writerEmail }
  };

  addReader = async (
      context: Context,
      origin: string,
      teamId: string,
      readerEmail: string | undefined,
      readerUsername: string | undefined
  ) => {
    // check pre conditions
    if ( ( readerEmail && readerUsername ) || ( !readerEmail && !readerUsername ) ) {
      throw new Error("Either username or email should be given.")
    }

    // init repositorires
    const teamRepository = await new TeamRepository().initialize(
        context.mongodb_provider.getConnection()
    );
    const userRepository = new UserRepository( context.postgresql_provider );

    const registeredUser = await userRepository.findUserByUsernameOrEmail( readerEmail ?? readerUsername as string, false );

    // if username is given, user must be registered
    if ( readerUsername && !registeredUser) {
      throw new Error( `User not found with given username: ${ readerUsername }` );
    }

    // if the user is not be registered, email can not be null
    if ( !registeredUser && !readerEmail ) {
      throw new Error( `Email must be given for non registered users`)
    }

    // overwrite email or username if user is already registered
    if ( registeredUser ) {
      if ( !readerEmail ) {
        readerEmail = registeredUser.email
      }

      if ( !readerUsername ) {
        readerUsername = registeredUser.username
      }
    }

    // email should be string if passes the conditions above
    readerEmail = readerEmail as string;

    const team = await teamRepository.addReader(
        teamId,
        {
          username: readerUsername,
          email: readerEmail,
          isVerified: false,
          payload: { invitationDate: Date.now() }
        }
    );

    if ( !team ) {
      throw new Error(`Can not find the team with given teamId: ${ teamId } or user is already in the team`)
    }

    await this.sendTeamEmail(
      context.message_queue_provider,
      origin,
      {
        username: readerUsername,
        email: readerEmail
      },
      {
        teamId: team.team_id,
        teamRole: TeamRole.READER,
        teamName: team.name
      }
    )

    if ( readerUsername ) {
      await this.sendJoinTeamRequestNotificationToQueue(
        context.message_queue_provider,
        {
          timestamp: new Date().getTime(),
          username: readerUsername,
          message: `${context.username} invited you to join ${team.name} as reader.`,
          sender: context.username,
          category: 'Team'
        }
      ); 
    }
    
    return { readerUsername, readerEmail }
  };

  removeWriter = async (
      context: Context,
      teamId: string,
      writerEmail: string
  ) => {
    const teamRepository = await new TeamRepository().initialize(
        context.mongodb_provider.getConnection()
    );

    await teamRepository.removeFromWriters(
        teamId,
        writerEmail
    );
  };

  removeReader = async (
      context: Context,
      teamId: string,
      readerEmail: string
  ) => {
    const teamRepository = await new TeamRepository().initialize(
        context.mongodb_provider.getConnection()
    );

    await teamRepository.removeFromReaders(
        teamId,
        readerEmail
    );
  };

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
      throw new Error("Permisson denied")
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

  deleteTeam = async (
      context: Context
  ) => {
    const teamRepository = await new TeamRepository().initialize(
        context.mongodb_provider.getConnection()
    );

    await teamRepository.deleteTeam(
        context.username
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
