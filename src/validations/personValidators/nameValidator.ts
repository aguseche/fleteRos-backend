export const validateName = (name: string): boolean => {
    return name.length >= 3 && name.length <= 50;
};
