import { Context, TeamRole, MongoDbProvider, TokenUtil } from "@open-template-hub/common";
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

    create = async(
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
        const tokenUtil = new TokenUtil( environment.args() );
        const tokens = tokenUtil.addTeamToToken(context.token, team._doc);

        return { tokens }
    }

    addWriter = async(
        context: Context,
        teamId: string,
        writerEmail: string
    ) => {
        const teamRepository = await new TeamRepository().initialize(
            context.mongodb_provider.getConnection()
        );

        const userRepository = new UserRepository( context.postgresql_provider );
        const writerUser = await userRepository.findUserByUsernameOrEmail( writerEmail );
        
        if(!writerUser) {
            throw new Error("user not found");
        }

        const team = await teamRepository.addWriter(
            context.username,
            {
                username: writerUser.username,
                email: writerEmail,
                isVerified: false
            }
        );

        const orchestrationChannelTag = this.environment.args().mqArgs?.orchestrationServerMessageQueueChannel;

        const joinTeamToken = this.tokenUtil.generateJoinTeamToken(writerUser.username, {id: team.team_id, role: TeamRole.WRITER });

        console.log("joinTeamToken: ", joinTeamToken);

        /*
        const joinTeamParams = {
            user: writerUser.username,
            email: writerEmail,
            joinTeamToken,
            team: team
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
        );*/
    }

    addReader = async(
        context: Context,
        teamId: string,
        readerEmail: string
    ) => {
        const teamRepository = await new TeamRepository().initialize(
            context.mongodb_provider.getConnection()
        );

        const userRepository = new UserRepository( context.postgresql_provider );
        const readerUser = await userRepository.findUserByUsernameOrEmail( readerEmail );

        const team = await teamRepository.addReader(
            context.username,
            {
                username: readerUser.username,
                email: readerEmail,
                isVerified: false
            }
        );

        const orchestrationChannelTag = this.environment.args().mqArgs?.orchestrationServerMessageQueueChannel;

        const joinTeamToken = this.tokenUtil.generateJoinTeamToken(readerUser.username, { id: team.team_id, role: TeamRole.READER } )
        console.log("joinTeamToken: ", joinTeamToken);

        /*const joinTeamParams = {
            user: readerUser.username,
            email: readerEmail,
            joinTeamToken,
            team: team
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
        );*/
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

        const teamRepositoryResponse = await teamRepository.verify(
            decodedToken.username,
            decodedToken.team.id,
            decodedToken.team.role
        );

        console.log(teamRepositoryResponse);
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