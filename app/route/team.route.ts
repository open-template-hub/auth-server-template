import { authorizedBy, ResponseCode, teamAuthorizedBy, TeamRole, UserRole } from '@open-template-hub/common';
import { Request, Response } from 'express';
import Router from 'express-promise-router';
import { TeamController } from '../controller/team.controller';

const subRoutes = {
  root: '/',
  writer: '/writer',
  reader: '/reader',
  verify: '/verify'
};

export const router = Router();

router.get( subRoutes.root, authorizedBy( [ UserRole.ADMIN, UserRole.DEFAULT ] ), async ( req: Request, res: Response ) => {
  const context = res.locals.ctx;

  const teams = await TeamController.getTeams(
      context.mongodb_provider,
      context.username
  );

  res.status( ResponseCode.OK ).json( teams );
} );

router.post( subRoutes.root, authorizedBy( [ UserRole.ADMIN, UserRole.DEFAULT ] ), async ( req: Request, res: Response ) => {
  const teamController = new TeamController();

  const teamCreateResponse = await teamController.create(
      res.locals.ctx,
      req.body.name,
      req.body.payload
  );

  res.status( ResponseCode.OK ).json( teamCreateResponse );
} );

router.delete( subRoutes.root, authorizedBy( [ UserRole.ADMIN, UserRole.DEFAULT ] ), teamAuthorizedBy( [ TeamRole.CREATOR ] ), async ( req: Request, res: Response ) => {
  const teamController = new TeamController();

  await teamController.deleteTeam(
      res.locals.ctx
  );

  res.status( ResponseCode.OK );
} );

router.post( subRoutes.writer, authorizedBy( [ UserRole.ADMIN, UserRole.DEFAULT ] ), teamAuthorizedBy( [ TeamRole.CREATOR ] ), async ( req: Request, res: Response ) => {
  const teamController = new TeamController();

  const addWriterResponse = await teamController.addWriter(
      res.locals.ctx,
      req.query.origin as string,
      req.body.teamId,
      req.body.writerEmail as string | undefined,
      req.body.writerUsername as string | undefined
  );

  res.status( ResponseCode.OK ).json( addWriterResponse );
} );

router.post( subRoutes.reader, authorizedBy( [ UserRole.ADMIN, UserRole.DEFAULT ] ), teamAuthorizedBy( [ TeamRole.CREATOR ] ), async ( req: Request, res: Response ) => {
  const teamController = new TeamController();

  const addReaderResponse = await teamController.addReader(
      res.locals.ctx,
      req.query.origin as string,
      req.body.teamId,
      req.body.readerEmail as string | undefined,
      req.body.readerUsername as string | undefined
  );

  res.status( ResponseCode.OK ).json( addReaderResponse );
} );

router.delete( subRoutes.writer, authorizedBy( [ UserRole.ADMIN, UserRole.DEFAULT ] ), teamAuthorizedBy( [ TeamRole.CREATOR ] ), async ( req: Request, res: Response ) => {
  const teamController = new TeamController();

  await teamController.removeWriter(
      res.locals.ctx,
      req.query.teamId as string,
      req.query.writerEmail as string
  );

  res.status( ResponseCode.OK );
} );

router.delete( subRoutes.reader, authorizedBy( [ UserRole.ADMIN, UserRole.DEFAULT ] ), teamAuthorizedBy( [ TeamRole.CREATOR ] ), async ( req: Request, res: Response ) => {
  const teamController = new TeamController();

  await teamController.removeReader(
      res.locals.ctx,
      req.query.teamId as string,
      req.body.readerEmail as string
  );

  res.status( ResponseCode.OK );
} );

router.post( subRoutes.verify, authorizedBy( [ UserRole.ADMIN, UserRole.DEFAULT ] ), async ( req: Request, res: Response ) => {
  const teamController = new TeamController();
  const context = res.locals.ctx;

  await teamController.verify(
      context,
      req.body.verifyToken as string
  );
  res.status( ResponseCode.OK );
} );
