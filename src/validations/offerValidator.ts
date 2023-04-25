import Offer from '../entities/Offer';
import { validatePrice } from './offerValidators/priceValidator';
import { validateState } from './offerValidators/stateValidator';
import { validateRate } from './offerValidators/rateValidator';
export const validateOffer = (offer: Offer): boolean => {
    return (
        validatePrice(offer.price) &&
        validateState(offer.state) &&
        validateRate(offer.rate)
    );
};
