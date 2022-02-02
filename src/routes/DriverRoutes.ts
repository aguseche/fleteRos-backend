import { Router } from 'express';
import passport from 'passport';
import DriverController from '../controllers/DriverController';
import { driver_validation } from '../middlewares/route_validator';
class driverRouter {
    public router: Router = Router();
    private driverController = new DriverController();

    constructor() {
        this.router.post('/driver/signup', this.driverController.signUp);
        this.router.post('/driver/signin', this.driverController.signIn);
        this.router.get(
            '/driver/signout',
            passport.authenticate('jwt', { session: false }),
            driver_validation,
            this.driverController.signOut
        );
        this.router.get(
            '/driver/me',
            passport.authenticate('jwt', { session: false }),
            driver_validation,
            this.driverController.getMe
        );
    }
}

export default driverRouter;
