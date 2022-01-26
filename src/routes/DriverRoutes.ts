import { Router } from 'express';
import passport from 'passport';
import DriverController from '../controllers/DriverController';
import { driver_validation } from '../middlewares/route_validator';
class driverRouter {
    public router: Router = Router();
    private driverController = new DriverController();

    constructor() {
        this.router.post('/auth/signup/driver', this.driverController.signUp);
        this.router.post('/auth/signin/driver', this.driverController.signIn);
        this.router.get(
            '/auth/signout/driver',
            passport.authenticate('jwt', { session: false }),
            driver_validation,
            this.driverController.signOut
        );
        this.router.get(
            '/auth/me/driver',
            passport.authenticate('jwt', { session: false }),
            driver_validation,
            this.driverController.getMe
        );
    }
}

export default driverRouter;
