export const validateGender = (gender: string): boolean => {
    return gender.length >= 3 && gender.length <= 20;
};
