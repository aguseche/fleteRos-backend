import { Router } from 'express';
import passport from 'passport';
import OfferController from '../controllers/OfferController';
import {
    user_validation,
    driver_validation
} from '../middlewares/route_validator';
class OfferRoutes {
    public router: Router = Router();
    private offerController = new OfferController();

    constructor() {
        this.router.post(
            '/offer/create/:id',
            passport.authenticate('jwt', { session: false }),
            driver_validation,
            this.offerController.registerOffer
        );
        this.router.put(
            '/offer/accept',
            passport.authenticate('jwt', { session: false }),
            user_validation,
            this.offerController.acceptOffer
        );
        this.router.delete(
            '/offer/delete',
            passport.authenticate('jwt', { session: false }),
            driver_validation,
            this.offerController.deleteOffer
        );
    }
}

export default OfferRoutes;
