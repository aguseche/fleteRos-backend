import Offer from '../entities/Offer';
import { validatePrice } from './offerValidators/priceValidator';
import { validateState } from './offerValidators/stateValidator';
import { validateRate } from './offerValidators/rateValidator';
export const validateOffer = (
    offer: Offer
): { valid: boolean; errorMessage?: string } => {
    if (!validatePrice(offer.price)) {
        return { valid: false, errorMessage: 'Invalid offer price.' };
    }
    if (!validateState(offer.state)) {
        return { valid: false, errorMessage: 'Invalid offer state.' };
    }
    if (!validateRate(offer.rate)) {
        return { valid: false, errorMessage: 'Invalid offer rate.' };
    }
    return { valid: true };
};
