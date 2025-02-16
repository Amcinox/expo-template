export interface Endpoints {
    auth: {
        login: EndpointConfig<object>;
        logout: EndpointConfig<object>;
        refresh: EndpointConfig<object>;
    };
}

export interface QueryParams {
    [key: string]: string | number | boolean | undefined;
}

type ID = string | number;


export interface ResourceParams {
    query?: QueryParams;
}

type EndpointConfig<T extends Partial<ResourceParams>> = {
    path: (params: T) => string;
    method: HTTPMethod;
};



export enum HTTPMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE",
    PATCH = "PATCH",
}

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
}

export interface FetchError {
    message: string;
    status?: number;
    data?: unknown;
}
