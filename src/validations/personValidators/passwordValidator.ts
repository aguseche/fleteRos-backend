export const validatePassword = (password: string): boolean => {
    // Basic password validation
    return password.length >= 8;
};
