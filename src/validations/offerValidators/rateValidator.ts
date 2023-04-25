export const validateRate = (rate: number | null | undefined): boolean => {
    if (rate === null || rate === undefined) {
        return true;
    }
    return rate >= 0 && rate <= 10;
};
