export const validateQuantity = (quantity: number): boolean => {
    return quantity > 0 && quantity < 1000;
};
