import { Router } from 'express';
import passport from 'passport';
import ShipmentController from '../controllers/ShipmentController';

class ShipmentRoutes {
    public router: Router = Router();
    private shipmentController = new ShipmentController();

    constructor() {
        this.router.post(
            '/shipment/create',
            passport.authenticate('jwt', { session: false }),
            this.shipmentController.registerShipment
        );
    }
}

export default ShipmentRoutes;
