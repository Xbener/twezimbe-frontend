export function formatWithCommas(number: any) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}