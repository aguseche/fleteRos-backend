import { Router } from 'express';
import UserController from '../controllers/UserController';

class AuthRouter {
    public router: Router = Router();
    private userController = new UserController();

    constructor() {
        this.router.post('/auth/signup', this.userController.signUp);
        this.router.post('/auth/signin', this.userController.signIn);
        this.router.get('/auth/signout', this.userController.signOut);

        //eliminar
        this.router.get('/auth/getUsers', this.userController.getUsers);
        this.router.post('/auth/getUser', this.userController.getUser);
    }
}

export default AuthRouter;
