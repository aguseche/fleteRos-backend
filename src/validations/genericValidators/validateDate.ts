export const validateDate = (date: Date | null): boolean => {
    if (date === null) {
        return false;
    }
    const today = new Date();
    const maxDate = new Date(
        today.getFullYear() + 1,
        today.getMonth(),
        today.getDate()
    );

    return (
        date instanceof Date &&
        !isNaN(date.getTime()) &&
        date.getTime() > today.getTime() &&
        date <= maxDate
    );
};
