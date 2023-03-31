export const validatePrice = (price: number): boolean => {
    return price >= 0 && price <= 1000000;
};
