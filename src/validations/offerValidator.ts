import Offer from '../entities/Offer';
import { validatePrice } from './offerValidators/priceValidator';
import { validateState } from './offerValidators/stateValidator';
export const validateOffer = (offer: Offer): boolean => {
    return validatePrice(offer.price) && validateState(offer.state);
};
