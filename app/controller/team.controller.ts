import { Context, JoinTeamMailActionParams, MessageQueueChannelType, MongoDbProvider, TokenUtil } from "@open-template-hub/common";
import { Environment } from "../../environment";
import { TeamRepository } from "../repository/team.repository";

export class TeamController {
    constructor(
        private environment = new Environment(),
        private tokenUtil: TokenUtil = new TokenUtil(environment.args())
    ) {
        /** intentionally blank */
    }

    create = async(
        context: Context
    ) => {
        const teamRepository = await new TeamRepository().initialize(
            context.mongodb_provider.getConnection()
        );

        const team = await teamRepository.create(
            context.username
        );

        const environment = new Environment();
        const tokenUtil = new TokenUtil( environment.args() );
        const token = tokenUtil.addTeamToToken(context.token, team._id);

        return { team, token }
    }

    addWriter = async(
        context: Context,
        writerUsername: string,
        writerEmail: string,
        isVerified: boolean
    ) => {
        const teamRepository = await new TeamRepository().initialize(
            context.mongodb_provider.getConnection()
        );

        const team = await teamRepository.addWriter(
            context.username,
            {
                username: writerUsername,
                email: writerEmail,
                isVerified
            }
        );

        const orchestrationChannelTag = this.environment.args().mqArgs?.orchestrationServerMessageQueueChannel;

        const joinTeamToken = this.tokenUtil.generateJoinTeamToken(writerUsername, team._id, "writers");

        const joinTeamParams = {
            user: writerUsername,
            email: writerEmail,
            joinTeamToken,
            teamId: team._id
        } as JoinTeamMailActionParams

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
        }

        await context.message_queue_provider.publish(
            message,
            orchestrationChannelTag as string
        );
    }

    addReader = async(
        context: Context,
        readerUsername: string,
        readerEmail: string,
        isVerified: boolean
    ) => {
        const teamRepository = await new TeamRepository().initialize(
            context.mongodb_provider.getConnection()
        );

        const team = await teamRepository.addReader(
            context.username,
            {
                username: readerUsername,
                email: readerEmail,
                isVerified
            }
        );

        const orchestrationChannelTag = this.environment.args().mqArgs?.orchestrationServerMessageQueueChannel;

        const joinTeamToken = this.tokenUtil.generateJoinTeamToken(readerUsername, team._id, "readers")

        const joinTeamParams = {
            user: readerUsername,
            email: readerEmail,
            joinTeamToken,
            teamId: team._id
        } as JoinTeamMailActionParams

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
        }

        await context.message_queue_provider.publish(
            message,
            orchestrationChannelTag as string
        );
    }

    removeWriter = async(
        context: Context,
        writerUsername: string
    ) => {
        const teamRepository = await new TeamRepository().initialize(
            context.mongodb_provider.getConnection()
        );

        await teamRepository.removeFromWriters(
            context.username,
            writerUsername
        )
    }

    removeReader = async(
        context: Context,
        readerUsername: string
    ) => {
        const teamRepository = await new TeamRepository().initialize(
            context.mongodb_provider.getConnection()
        );

        await teamRepository.removeFromReaders(
            context.username,
            readerUsername
        )
    }

    static getTeams = async(
        mongodb_provider: MongoDbProvider,
        username: string
    ) => {
        const teamRepository = await new TeamRepository().initialize(
            mongodb_provider.getConnection()
        );

        return teamRepository.getTeams(
            username
        );
    }

    verify = async(
        mongodb_provider: MongoDbProvider,
        token: string
    ) => {
        const environment = new Environment();
        const tokenUtil = new TokenUtil( environment.args() );
        const decodedToken = tokenUtil.verifyTeamToken(token) as any;

        const teamRepository = await new TeamRepository().initialize(
            mongodb_provider.getConnection()
        );

        teamRepository.verify(
            decodedToken.username,
            decodedToken.teamId,
            decodedToken.role
        );
    }

    deleteTeam = async(
        context: Context
    ) => {
        const teamRepository = await new TeamRepository().initialize(
            context.mongodb_provider.getConnection()
        );

        await teamRepository.deleteTeam(
            context.username
        );
    }
}