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
        this.router.get(
            '/offer/me',
            passport.authenticate('jwt', { session: false }),
            this.offerController.getMyOffers
        );
        this.router.post(
            '/offer/create',
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
        this.router.put(
            '/offer/cancel',
            passport.authenticate('jwt', { session: false }),
            user_validation,
            this.offerController.cancelOffer
        );
        this.router.put(
            '/offer/delete',
            passport.authenticate('jwt', { session: false }),
            driver_validation,
            this.offerController.deleteOffer
        );
        this.router.put(
            '/offer/rate',
            passport.authenticate('jwt', { session: false }),
            user_validation,
            this.offerController.rateOffer
        );
    }
}

export default OfferRoutes;
