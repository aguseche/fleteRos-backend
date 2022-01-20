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
        this.router.get(
            '/shipment/getValidShipments',
            passport.authenticate('jwt', { session: false }),
            this.shipmentController.getValidShipments
        );
        this.router.put(
            '/shipment/update/:id',
            passport.authenticate('jwt', { session: false }),
            this.shipmentController.updateShipment
        );
    }
}

export default ShipmentRoutes;
