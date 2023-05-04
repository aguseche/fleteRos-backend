import Item from '../entities/Item';
import { validateSize } from './itemValidators/sizeValidator';
import { validateWeight } from './itemValidators/weightValidator';
import { validateQuantity } from './itemValidators/quantityValidator';
import { validateDescription } from './genericValidators/descriptionValidator';

export const validateItem = (
    item: Item
): { valid: boolean; errorMessage?: string } => {
    if (!validateDescription(item.description)) {
        return { valid: false, errorMessage: 'Invalid item description.' };
    }
    if (!validateWeight(item.weight)) {
        return { valid: false, errorMessage: 'Invalid item weight.' };
    }
    if (!validateSize(item.height, item.width, item.depth)) {
        return { valid: false, errorMessage: 'Invalid item size.' };
    }
    if (!validateQuantity(item.quantity)) {
        return { valid: false, errorMessage: 'Invalid item quantity.' };
    }
    return { valid: true };
};
