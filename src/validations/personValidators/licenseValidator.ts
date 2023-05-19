export const validateLicense = (license: string): boolean => {
    return license.length >= 3 && license.length <= 45;
};
