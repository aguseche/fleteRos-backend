import { Router } from 'express';
import passport from 'passport';
import UserController from '../controllers/UserController';

class AuthRouter {
    public router: Router = Router();
    private userController = new UserController();

    constructor() {
        this.router.post('/auth/signup', this.userController.signUp);
        this.router.post('/auth/signin', this.userController.signIn);
        this.router.get(
            '/auth/signout',
            passport.authenticate('jwt', { session: false }),
            this.userController.signOut
        );
        this.router.get(
            '/auth/me',
            passport.authenticate('jwt', { session: false }),
            this.userController.getMe
        );
    }
}

export default AuthRouter;
