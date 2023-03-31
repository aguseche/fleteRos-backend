import Shipment from '../entities/Shipment';
import { validateDate } from './genericValidators/validateDate';
import { validateDescription } from './genericValidators/descriptionValidator';
import { validateLocation } from './shipmentValidator/locationValidator';
export const validateShipment = (shipment: Shipment): boolean => {
    return (
        validateDescription(shipment.state) &&
        validateDate(shipment.shipDate) &&
        validateLocation(shipment.locationFrom) &&
        validateLocation(shipment.locationTo)
    );
};
