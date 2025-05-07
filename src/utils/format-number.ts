
import numeral from 'numeral';

export function toCurrency(
    number: string | number = 0,
    currency = "GBP",
    withSymbol = true,
) {
    // Check if it's a string and convert to number
    if (typeof number === 'string') {
        number = parseFloat(number);
    }

    return withSymbol
        ? new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(number)
        : new Intl.NumberFormat('en-US', {
            style: 'decimal',
            useGrouping: true,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(number);
}


type InputValue = string | number | null;
export function fPercent(number: InputValue) {
    const format = number ? numeral(Number(number) / 100).format('0.0%') : '';

    return result(format, '.0');
}

function result(format: string, key = '.00') {
    const isInteger = format.includes(key);

    return isInteger ? format.replace(key, '') : format;
}
