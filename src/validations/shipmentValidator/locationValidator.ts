export const validateLocation = (description: string): boolean => {
    return description.length > 10 && description.length <= 100;
};
