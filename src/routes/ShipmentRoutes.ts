import { Router } from 'express';
import passport from 'passport';
import ShipmentController from '../controllers/ShipmentController';
import {
    user_validation,
    driver_validation
} from '../middlewares/route_validator';
class ShipmentRoutes {
    public router: Router = Router();
    private shipmentController = new ShipmentController();

    constructor() {
        this.router.post(
            '/shipment/create',
            passport.authenticate('jwt', { session: false }),
            user_validation,
            this.shipmentController.registerShipment
        );
        this.router.get(
            '/shipment/getValidShipments',
            passport.authenticate('jwt', { session: false }),
            driver_validation,
            this.shipmentController.getValidShipments
        );
        this.router.put(
            '/shipment/update/:id',
            passport.authenticate('jwt', { session: false }),
            user_validation,
            this.shipmentController.updateShipment
        );
    }
}

export default ShipmentRoutes;
