import { ResponseCode, teamAuthorizedBy } from '@open-template-hub/common';
import { TeamRole } from '@open-template-hub/common/lib/enum/team-role.enum';
import { Request, Response, Router } from 'express';
import { TeamController } from '../controller/team.controller';

const subRoutes = {
    root: "/",
    writer: "/writer",
    reader: "/reader",
    verify: "/verify"
}

export const router = Router()

router.get(subRoutes.root, teamAuthorizedBy([ TeamRole.CREATOR, TeamRole.READER, TeamRole.WRITER ]), async(req: Request, res: Response) => {
    const context = res.locals.ctx;

    const team = await TeamController.getTeams(
        context.mongodb_provider,
        context.username
    );

    res.status(ResponseCode.OK).json(team);
});

router.post(subRoutes.root, async(req: Request, res: Response) => {
    const teamController = new TeamController();

    const teamCreateResponse = await teamController.create(
        res.locals.ctx,
        req.body.name
    );

    res.status(ResponseCode.OK).json(teamCreateResponse);
});

router.delete(subRoutes.root, teamAuthorizedBy([ TeamRole.CREATOR, TeamRole.READER, TeamRole.WRITER ]), async(req: Request, res: Response) => {
    const teamController = new TeamController();

    await teamController.deleteTeam(
        res.locals.ctx
    );

    res.status(ResponseCode.OK);
})

router.post(subRoutes.writer, teamAuthorizedBy([ TeamRole.CREATOR ]), async(req: Request, res: Response) => {
    const teamController = new TeamController();

    await teamController.addWriter(
        res.locals.ctx,
        req.body.teamId,
        req.body.writerUsername as string,
        req.body.writerEmail as string,
        req.body.isVerified as boolean
    )

    res.status(ResponseCode.OK);
})

router.get( subRoutes.verify, teamAuthorizedBy([ TeamRole.CREATOR ]), async ( req: Request, res: Response ) => {
    const teamController = new TeamController();
    const context = res.locals.ctx;
    await teamController.verify(
        context.postgresql_provider,
        req.query.token as string
    );
    res.status( ResponseCode.NO_CONTENT ).json( {} );
  } );