import { SHIPMENT_STATE } from '../../utils/constants';
export const validateState = (state: string): boolean => {
    return Object.values(SHIPMENT_STATE).includes(state);
};
