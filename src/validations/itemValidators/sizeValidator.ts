export const validateSize = (size: string): boolean => {
    return size.length > 0 && size.length <= 50;
};
