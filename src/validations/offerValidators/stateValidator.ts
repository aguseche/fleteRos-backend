import { OFFER_STATE } from '../../utils/constants';
export const validateState = (state: string): boolean => {
    return Object.values(OFFER_STATE).includes(state);
};
