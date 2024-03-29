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
            '/shipment/available',
            passport.authenticate('jwt', { session: false }),
            driver_validation,
            this.shipmentController.getAvailable
        );
        this.router.put(
            '/shipment',
            passport.authenticate('jwt', { session: false }),
            user_validation,
            this.shipmentController.updateShipment
        );
        this.router.put(
            '/shipment/delete',
            passport.authenticate('jwt', { session: false }),
            user_validation,
            this.shipmentController.deleteShipment
        );
        this.router.put(
            '/shipment/deliver',
            passport.authenticate('jwt', { session: false }),
            driver_validation,
            this.shipmentController.deliverShipment
        );
        // this.router.put(
        //     '/shipment/receive',
        //     passport.authenticate('jwt', { session: false }),
        //     user_validation,
        //     this.shipmentController.receiveShipment
        // );
    }
}

export default ShipmentRoutes;
