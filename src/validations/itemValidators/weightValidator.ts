export const validateWeight = (weight: number): boolean => {
    return weight > 0 && weight < 1000;
};
