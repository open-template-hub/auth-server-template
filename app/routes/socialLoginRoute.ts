import Router from 'express-promise-router';
import { Request, Response } from 'express';
import { SocialLoginService } from '../services/socialLoginService';

const subRoutes = {
 root: '/',
 loginUrl: '/login-url',
 login: '/login',
 loginWithAccessToken: '/login-with-access-token'
}

const router = Router();
const socialLoginService = new SocialLoginService();

router.post(subRoutes.loginUrl, async (req: Request, res: Response) => {
 const response = await socialLoginService.loginUrl(res.locals.ctx.dbProviders.postgreSqlProvider, req.body);
 res.status(200).json({loginUrl: response})
});

router.post(subRoutes.login, async (req: Request, res: Response) => {
 const response = await socialLoginService.login(res.locals.ctx.dbProviders.postgreSqlProvider, req.body);
 res.status(200).json({accessToken: response.accessToken, refreshToken: response.refreshToken})
});

router.post(subRoutes.loginWithAccessToken, async (req: Request, res: Response) => {

 //const response = await socialLoginService.loginWithAccessToken(req.body);
 const response = {accessToken: '', refreshToken: ''};
 res.status(200).json({accessToken: response.accessToken, refreshToken: response.refreshToken})
});

export = router;
