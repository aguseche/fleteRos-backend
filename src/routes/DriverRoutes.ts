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
        this.router.post(
            '/driver/signout',
            passport.authenticate('jwt', { session: false }),
            driver_validation,
            this.driverController.signOut
        );
        this.router.put(
            '/driver',
            passport.authenticate('jwt', { session: false }),
            driver_validation,
            this.driverController.updateDriver
        );
        this.router.get(
            '/driver/offers/sent',
            passport.authenticate('jwt', { session: false }),
            driver_validation,
            this.driverController.getOffersSent
        );
        this.router.get(
            '/driver/offers/accepted',
            passport.authenticate('jwt', { session: false }),
            driver_validation,
            this.driverController.getOffersAccepted
        );
        this.router.get(
            '/driver/offers/delivered',
            passport.authenticate('jwt', { session: false }),
            driver_validation,
            this.driverController.getOffersDelivered
        );
        this.router.get(
            '/driver/offers/deleted',
            passport.authenticate('jwt', { session: false }),
            driver_validation,
            this.driverController.getOffersDeleted
        );
        this.router.get(
            '/driver/offers/cancelled',
            passport.authenticate('jwt', { session: false }),
            driver_validation,
            this.driverController.getOffersCancelled
        );
        this.router.get(
            '/driver/shipments/available',
            passport.authenticate('jwt', { session: false }),
            driver_validation,
            this.driverController.getShipmentsAvailable
        );
        this.router.get(
            '/driver/shipments/active',
            passport.authenticate('jwt', { session: false }),
            driver_validation,
            this.driverController.getShipmentsActive
        );
        this.router.get(
            '/driver/data',
            passport.authenticate('jwt', { session: false }),
            driver_validation,
            this.driverController.getMyData
        );
    }
}

export default driverRouter;
