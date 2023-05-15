import { DELIVERY_SHIFT } from '../../utils/constants';
export const validateDeliveryShift = (delivery_shift: string): boolean => {
    return Object.values(DELIVERY_SHIFT).includes(delivery_shift);
};
