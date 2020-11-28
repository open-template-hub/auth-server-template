import Router from 'express-promise-router';
import { Request, Response } from 'express';
import { ResponseCode } from '../constant';

const subRoutes = {
  root: '/',
  alive: '/alive',
};

export const publicRoutes = [subRoutes.alive];

export const router = Router();

router.get(subRoutes.alive, async (req: Request, res: Response) => {
  res.status(ResponseCode.OK).send();
});
