export const validateDescription = (description: string): boolean => {
    return description.length > 10 && description.length <= 1000;
};
