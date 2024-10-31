export const formatNumberWithCommas = (value: string): string => {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};