import Item from '../entities/Item';
import { validateSize } from './itemValidators/sizeValidator';
import { validateWeight } from './itemValidators/weightValidator';
import { validateQuantity } from './itemValidators/quantityValidator';
import { validateDescription } from './genericValidators/descriptionValidator';

export const validateItem = (item: Item): boolean => {
    return (
        validateDescription(item.description) &&
        validateWeight(item.weight) &&
        validateSize(item.height, item.width, item.depth) &&
        validateQuantity(item.quantity)
    );
};
