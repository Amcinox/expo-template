// create a function to handle errors error.response.data.errors[0].message  or error.response.data.message etc .. and return the error message

export const errorHandler = (error: any, fallback = "Oups ! Something went wrong."): string => {
    if (error.response) {
        if (error.response.data && error.response.data.errors && error.response.data.errors.length > 0) {
            return error.response.data.errors[0].message || fallback;
        } else if (error.response.data && error.response.data.message) {
            return error.response.data.message || fallback;
        } else {
            return fallback;
        }
    } else if (error.request) {
        return 'ERR_NO_RESPONSE';
    } else {
        return error.message || 'ERR_UNKNOWN_ERROR';
    }
}