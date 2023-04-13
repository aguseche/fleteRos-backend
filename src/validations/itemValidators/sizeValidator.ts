export const validateSize = (
    height: number,
    width: number,
    depth: number
): boolean => {
    const min = 0;
    const max = 100000;
    return (
        height >= min &&
        height <= max &&
        width >= min &&
        width <= max &&
        depth >= min &&
        depth <= max
    );
};
