import { Router } from 'express';
import passport from 'passport';
import UserController from '../controllers/UserController';
import { user_validation } from '../middlewares/route_validator';

class AuthRouter {
    public router: Router = Router();
    private userController = new UserController();

    constructor() {
        this.router.post('/user/signup', this.userController.signUp);
        this.router.post('/user/signin', this.userController.signIn);
        this.router.get(
            '/user/signout',
            passport.authenticate('jwt', { session: false }),
            user_validation,
            this.userController.signOut
        );
        this.router.get(
            '/user/me',
            passport.authenticate('jwt', { session: false }),
            user_validation,
            this.userController.getMe
        );
    }
}

export default AuthRouter;
