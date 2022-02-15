import { Router } from 'express';
import passport from 'passport';
import AuthController from '../controllers/AuthController';
// import {
//     user_validation,
//     driver_validation
// } from '../middlewares/route_validator';

class AuthRouter {
    public router: Router = Router();
    private authController = new AuthController();

    constructor() {
        this.router.get(
            '/getMe',
            passport.authenticate('jwt', { session: false }),
            // user_validation,
            // driver_validation,
            this.authController.getMe
        );
    }
}

export default AuthRouter;
