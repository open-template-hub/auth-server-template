import { Context, TeamRole, MongoDbProvider, TokenUtil, JoinTeamMailActionParams, MessageQueueChannelType, MessageQueueProvider, NotificationParams, BusinessLogicActionType, QueueMessage } from "@open-template-hub/common";
import { Environment } from "../../environment";
import { TeamRepository } from "../repository/team.repository";
import { UserRepository } from "../repository/user.repository";

export class TeamController {
    constructor(
        private environment = new Environment(),
        private tokenUtil: TokenUtil = new TokenUtil(environment.args())
    ) {
        /** intentionally blank */
    }

    create = async (
        context: Context,
        name: string,
        imageId: string | undefined
    ) => {
        const teamRepository = await new TeamRepository().initialize(
            context.mongodb_provider.getConnection()
        );

        const team = await teamRepository.create(
            context.username,
            name,
            imageId
        );

        const environment = new Environment();
        const tokenUtil = new TokenUtil(environment.args());
        const tokens = tokenUtil.addTeamToToken(context.token, team._doc);

        return { tokens }
    }

    addWriter = async (
        context: Context,
        origin: string,
        teamId: string,
        writerEmail: string
    ) => {
        const teamRepository = await new TeamRepository().initialize(
            context.mongodb_provider.getConnection()
        );

        const userRepository = new UserRepository(context.postgresql_provider);
        const writerUser = await userRepository.findUserByUsernameOrEmail(writerEmail);

        if (!writerUser) {
            throw new Error("user not found");
        }

        const team = await teamRepository.addWriter(
            teamId,
            {
                username: writerUser.username,
                email: writerUser.email,
                isVerified: false
            }
        );

        const orchestrationChannelTag = this.environment.args().mqArgs?.orchestrationServerMessageQueueChannel;

        const joinTeamToken = this.tokenUtil.generateJoinTeamToken(writerUser.username, { id: team.team_id, role: TeamRole.WRITER });
        console.log("joinTeamToken: ", joinTeamToken);

        const joinTeamParams = {
            user: writerUser.username,
            email: writerEmail,
            joinTeamToken,
            teamId: team.team_id,
            teamName: team.name,
            joinTeamUrl: origin + "/join-team"
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

        const notificationParams = {
            timestamp: new Date().getTime(),
            username: writerUser.username,
            message: "Join request from " + team.name
        } as NotificationParams;

        await this.sendJoinTeamRequestNotificationToQueue(
            context.message_queue_provider,
            notificationParams
        )
    }

    addReader = async (
        context: Context,
        origin: string,
        teamId: string,
        readerEmail: string
    ) => {
        const teamRepository = await new TeamRepository().initialize(
            context.mongodb_provider.getConnection()
        );

        const userRepository = new UserRepository(context.postgresql_provider);
        const readerUser = await userRepository.findUserByUsernameOrEmail(readerEmail);

        const team = await teamRepository.addReader(
            teamId,
            {
                username: readerUser.username,
                email: readerUser.email,
                isVerified: false
            }
        );

        const orchestrationChannelTag = this.environment.args().mqArgs?.orchestrationServerMessageQueueChannel;

        const joinTeamToken = this.tokenUtil.generateJoinTeamToken(readerUser.username, { id: team.team_id, role: TeamRole.READER })

        const joinTeamParams = {
            user: readerUser.username,
            email: readerEmail,
            joinTeamToken,
            teamId: team.team_id,
            teamName: team.name,
            joinTeamUrl: origin + "/join-team"
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

        const notificationParams = {
            timestamp: new Date().getTime(),
            username: readerUser.username,
            message: "Join request from " + team.name
        } as NotificationParams;

        await this.sendJoinTeamRequestNotificationToQueue(
            context.message_queue_provider,
            notificationParams
        )
    }

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
        )
    }

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
        )
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
    }

    verify = async (
        mongodb_provider: MongoDbProvider,
        token: string
    ) => {
        const environment = new Environment();
        const tokenUtil = new TokenUtil(environment.args());
        const decodedToken = tokenUtil.verifyTeamToken(token) as any;

        const teamRepository = await new TeamRepository().initialize(
            mongodb_provider.getConnection()
        );

        await teamRepository.verify(
            decodedToken.username,
            decodedToken.team.id,
            decodedToken.team.role
        );
    }

    deleteTeam = async (
        context: Context
    ) => {
        const teamRepository = await new TeamRepository().initialize(
            context.mongodb_provider.getConnection()
        );

        await teamRepository.deleteTeam(
            context.username
        );
    }

    private async sendJoinTeamRequestNotificationToQueue(
        messageQueueProvider: MessageQueueProvider,
        notificationParams: NotificationParams
    ) {
        const orchestrationChannelTag = this.environment.args().mqArgs?.orchestrationServerMessageQueueChannel

        const message = {
            sender: MessageQueueChannelType.AUTH,
            receiver: MessageQueueChannelType.BUSINESS_LOGIC,
            message: {
                notification: {
                    params: notificationParams
                }
            } as BusinessLogicActionType
        } as QueueMessage

        await messageQueueProvider.publish(
            message,
            orchestrationChannelTag as string
        )
    }
}
