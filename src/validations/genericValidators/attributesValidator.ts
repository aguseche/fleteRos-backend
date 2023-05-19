export const validateAttributes = (
    original_attributes: string[],
    attributes: string[]
): boolean => {
    for (const str of original_attributes) {
        if (!attributes.includes(str)) {
            return false;
        }
    }
    return true;
};
