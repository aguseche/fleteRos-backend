import Offer from '../entities/Offer';
import { validatePrice } from './offerValidators/priceValidator';
export const validateOffer = (offer: Offer): boolean => {
    return validatePrice(offer.price);
};
