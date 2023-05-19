export const validateDistance = (
    distance: number | null | undefined
): boolean => {
    if (distance === null || distance === undefined) {
        return true;
    }
    return distance >= 0 && distance <= 1000000;
};
