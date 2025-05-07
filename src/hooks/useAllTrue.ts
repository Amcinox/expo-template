import { useState, useEffect, DependencyList } from 'react';

/**
 * A custom React hook that returns true only if all of the provided boolean values are true,
 * and false if any of the values is false.
 * 
 * @param {...(boolean | undefined | null)} booleans - One or more boolean values to check
 * @returns {boolean} - True only if all booleans are true, false if any is false
 * 
 * @example
 * const isReady = useAllTrue(isDataLoaded, isUserAuthenticated, isFormValid);
 * // isReady will be true only if all three conditions are true
 */
function useAllTrue(...booleans: Array<boolean | undefined | null>): boolean {
    const [allTrue, setAllTrue] = useState<boolean>(false);

    useEffect(() => {
        // Check if all of the boolean values are true
        const result = booleans.every(value => Boolean(value) === true);
        setAllTrue(result);
    }, booleans as DependencyList);

    return allTrue;
}

export default useAllTrue;