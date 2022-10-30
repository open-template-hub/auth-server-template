import { ResponseCode } from '@open-template-hub/common';
import { Request, Response, Router } from 'express';
import { TeamController } from '../controller/team.controller';

const subRoutes = {
    root: "/",
    writer: "/writer",
    reader: "/reader",
    verify: "/verify"
}

export const router = Router()

router.get(subRoutes.root, async(req: Request, res: Response) => {
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
        res.locals.ctx
    );

    res.status(ResponseCode.OK).json(teamCreateResponse);
});

router.delete(subRoutes.root, async(req: Request, res: Response) => {
    const teamController = new TeamController();

    const team = await teamController.deleteTeam(
        res.locals.ctx
    );

    res.status(ResponseCode.OK);
})

router.post(subRoutes.writer, async(req: Request, res: Response) => {
    const teamController = new TeamController();

    await teamController.addWriter(
        res.locals.ctx,
        req.body.writerUsername as string,
        req.body.writerEmail as string,
        req.body.isVerified as boolean
    )

    res.status(ResponseCode.OK);
})

router.get( subRoutes.verify, async ( req: Request, res: Response ) => {
    const teamController = new TeamController();
    const context = res.locals.ctx;
    await teamController.verifyWriter(
        context.postgresql_provider,
        req.query.token as string
    );
    res.status( ResponseCode.NO_CONTENT ).json( {} );
  } );