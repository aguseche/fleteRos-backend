import Shipment from '../entities/Shipment';
import { validateDate } from './genericValidators/validateDate';
import { validateDescription } from './genericValidators/descriptionValidator';
import { validateLocation } from './shipmentValidator/locationValidator';
import { validateState } from './shipmentValidator/stateValidator';
export const validateShipment = (
    shipment: Shipment
): { valid: boolean; errorMessage?: string } => {
    if (!validateDate(shipment.shipDate)) {
        return {
            valid: false,
            errorMessage: `Invalid shipment date: ${shipment.shipDate}`
        };
    }
    if (!validateLocation(shipment.locationFrom)) {
        return {
            valid: false,
            errorMessage: `Invalid shipment location from: ${shipment.locationFrom}`
        };
    }
    if (!validateLocation(shipment.locationTo)) {
        return {
            valid: false,
            errorMessage: `Invalid shipment location to: ${shipment.locationTo}`
        };
    }
    if (!validateState(shipment.state)) {
        return {
            valid: false,
            errorMessage: `Invalid shipment state: ${shipment.state}`
        };
    }
    return { valid: true };
};
