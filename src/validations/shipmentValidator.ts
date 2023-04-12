import Shipment from '../entities/Shipment';
import { validateDate } from './genericValidators/validateDate';
import { validateDescription } from './genericValidators/descriptionValidator';
import { validateLocation } from './shipmentValidator/locationValidator';
import { validateState } from './shipmentValidator/stateValidator';
export const validateShipment = (shipment: Shipment): boolean => {
    return (
        validateDate(shipment.shipDate) &&
        validateLocation(shipment.locationFrom) &&
        validateLocation(shipment.locationTo) &&
        validateState(shipment.state)
    );
};
