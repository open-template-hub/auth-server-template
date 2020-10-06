import Router from 'express-promise-router';
import { Request, Response } from 'express';
import { ResponseCode } from '../util/constant';

const subRoutes = {
 root: '/',
 alive: '/alive'
}

const router = Router();

router.get(subRoutes.alive, async (req: Request, res: Response) => {
 res.status(ResponseCode.OK).send();
});

export = router;
