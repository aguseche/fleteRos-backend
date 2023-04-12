import { OFFER_STATE } from '../../constants';
export const validateState = (state: string): boolean => {
    return Object.values(OFFER_STATE).includes(state);
};
