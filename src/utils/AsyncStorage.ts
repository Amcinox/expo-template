import AsyncStorage from '@react-native-async-storage/async-storage';
type AsyncReturnType<T extends (...args: any) => Promise<any>> = ReturnType<T> extends Promise<infer U> ? U : never;

type KeyValue = {
    key: string;
    defaultValue: any;
};




export const getValueFromAsyncStorage = async (
    key: string,
    defaultValue: any): Promise<AsyncReturnType<typeof JSON.parse>> => {
    let value = defaultValue;

    try {
        const jsonValue = await AsyncStorage.getItem(key);

        if (jsonValue !== null) {
            value = JSON.parse(jsonValue);
        } else {
            await AsyncStorage.setItem(key, JSON.stringify(defaultValue));
        }
    } catch (error: Error | any) {
        console.log(error)
    }

    return value;
};




type MultiValues = Record<string, AsyncReturnType<typeof JSON.parse>>;

export const getMultiFromAsyncStorage = async (
    keyValues: KeyValue[],
): Promise<MultiValues> => {
    const values: MultiValues = {};

    try {
        const keys = keyValues.map((kv) => kv.key);
        const jsonValues = await AsyncStorage.multiGet(keys);

        jsonValues.forEach(([key, jsonValue], index) => {
            if (jsonValue !== null) {
                values[key] = JSON.parse(jsonValue);
            } else {
                const defaultValue = keyValues[index].defaultValue;
                values[key] = defaultValue;
                AsyncStorage.setItem(key, JSON.stringify(defaultValue));
            }
        });
    } catch (error: Error | any) {
        console.log(error)
    }

    return values;
};




export const saveItem = async (key: string, value: any) => {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(value))
    } catch (error: Error | any) {
        console.log(error)
    }
}

export const deleteItem = async (key: string) => {
    try {
        await AsyncStorage.removeItem(key)
    } catch (error: Error | any) {
        console.log(error)
    }
}

export const getItem = async (key: string) => {
    try {
        const value = await AsyncStorage.getItem(key)
        if (value !== null) {
            return JSON.parse(value)
        }
    } catch (error: Error | any) {
        console.log(error)
    }
}