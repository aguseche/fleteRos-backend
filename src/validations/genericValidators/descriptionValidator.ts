export const validateDescription = (description: string): boolean => {
    return description.length >= 3 && description.length <= 1000;
};
