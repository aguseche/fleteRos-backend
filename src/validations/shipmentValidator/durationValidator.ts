export const validateDuration = (
    duration: number | null | undefined
): boolean => {
    if (duration === null || duration === undefined) {
        return true;
    }
    return duration >= 0 && duration <= 1000;
};
