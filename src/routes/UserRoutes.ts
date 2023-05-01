import { Router } from 'express';
import passport from 'passport';
import UserController from '../controllers/UserController';
import { user_validation } from '../middlewares/route_validator';

class UserRouter {
    public router: Router = Router();
    private userController = new UserController();

    constructor() {
        this.router.post('/user/signup', this.userController.signUp);
        this.router.post('/user/signin', this.userController.signIn);
        this.router.post(
            '/user/signout',
            passport.authenticate('jwt', { session: false }),
            user_validation,
            this.userController.signOut
        );
        this.router.put(
            '/user',
            passport.authenticate('jwt', { session: false }),
            user_validation,
            this.userController.updateUser
        );
        this.router.get(
            '/user/shipments/waiting_offers',
            passport.authenticate('jwt', { session: false }),
            user_validation,
            this.userController.getShipmentsWaitingOffers
        );
        this.router.get(
            '/user/shipments/active',
            passport.authenticate('jwt', { session: false }),
            user_validation,
            this.userController.getShipmentsActive
        );
        this.router.get(
            '/user/shipments/cancelled',
            passport.authenticate('jwt', { session: false }),
            user_validation,
            this.userController.getShipmentsCancelled
        );
        this.router.get(
            '/user/shipments/delivered',
            passport.authenticate('jwt', { session: false }),
            user_validation,
            this.userController.getShipmentsDelivered
        );
    }
}

export default UserRouter;
