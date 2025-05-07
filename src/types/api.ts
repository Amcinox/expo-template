export interface Endpoints {
    auth: {
        login: EndpointConfig<object>;
        logout: EndpointConfig<object>;
        refresh: EndpointConfig<object>;
        userExists: EndpointConfig<object>;
        forgotPassword: EndpointConfig<object>;
        confirmForgotPassword: EndpointConfig<object>;
        changePassword: EndpointConfig<object>;
    },
    customer: {
        verify_customer: EndpointConfig<{}>;
        verify_otp: EndpointConfig<{}>;
        create_customer: EndpointConfig<{}>,
        update_customer: EndpointConfig<{}>,
        get_customer: EndpointConfig<{}>
    },


}

export interface QueryParams {
    [key: string]: string | number | boolean | undefined;
}

type ID = string | number;


export interface ResourceParams {
    query?: QueryParams;

    categoryIds?: any
    uncategorized?: boolean;
    item_per_page?: number;
    page_number?: number;
    per_page?: number;

}

type EndpointConfig<T extends Partial<ResourceParams>> = {
    path: (params: T) => string;
    method: HTTPMethod;
};




export interface FetchConfig<TData, TError> {
    endpoint: string;
    method?: HTTPMethod;
    body?: unknown;
    params?: Record<string, string>;
    timeout?: number;
    retry?: {
        attempts: number;
        delay: number;
    };
    headers?: RequestInit["headers"];
    onSuccess?: (data: TData) => void | Promise<void>;
    onError?: (error: TError) => void | Promise<void>;
    onRetry?: (attempt: number, error: TError) => void | Promise<void>;
    authorized?: boolean;
    onUploadProgress?: (progressEvent: any) => void; // Added onUploadProgress here
}

export interface FetchError {
    message: string;
    status?: number;
    data?: unknown;
}

export enum HTTPMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE',

}

