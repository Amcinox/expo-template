import { FetchConfig, FetchError } from "@/types/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data?: any
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}


export class ApiHandler {
  private baseUrl: string;
  private defaultConfig: Partial<FetchConfig<any, any>>;

  constructor(baseUrl: string, defaultConfig: Partial<FetchConfig<any, any>> = {}) {
    this.baseUrl = baseUrl;
    this.defaultConfig = defaultConfig;
  }

  private createUrl(endpoint: string, params?: Record<string, string>): string {
    const normalizedBaseUrl = this.baseUrl.endsWith('/')
      ? this.baseUrl.slice(0, -1)
      : this.baseUrl;

    const normalizedEndpoint = endpoint.startsWith('/')
      ? endpoint
      : `/${endpoint}`;

    const url = new URL(normalizedBaseUrl + normalizedEndpoint);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    return url.toString();
  }

  private async fetchWithTimeout(
    request: Request,
    timeout?: number
  ): Promise<Response> {
    if (!timeout) {
      return fetch(request);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(request, {
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async handleResponse<TData>(response: Response): Promise<TData> {
    const contentType = response.headers.get('content-type');

    if (!response.ok) {
      let errorData;
      if (contentType?.includes('application/json')) {
        errorData = await response.json();
      } else {
        errorData = await response.text();
      }
      throw new ApiError(
        errorData?.message || 'Request failed',
        response.status,
        errorData
      );
    }

    if (contentType?.includes('application/json')) {
      return response.json();
    }

    return response.text() as unknown as TData;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetch<TData, TError = FetchError>(
    config: FetchConfig<TData, TError>
  ): Promise<TData> {
    const mergedConfig = { ...this.defaultConfig, ...config };
    const {
      endpoint,
      method = 'GET',
      body,
      headers: customHeaders,
      params,
      timeout,
      retry,
      onSuccess,
      onError,
      onRetry,
      authorized = true
    } = mergedConfig;
    const url = this.createUrl(endpoint, params);

    const headers = new Headers({
      'Content-Type': 'application/json',
      ...customHeaders,
    });

    if (authorized) {
      const session = { idToken: "" }
      if (session?.idToken) {
        headers.set('authorization', `Bearer ${session.idToken}`);
      }
    }

    const requestInit: RequestInit = {
      method,
      headers,
    };

    if (method !== 'GET' && body) {
      requestInit.body = JSON.stringify(body);
    }


    const request = new Request(url, requestInit);
    let lastError: TError | undefined;
    const attempts = retry?.attempts ?? 1;

    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        const response = await this.fetchWithTimeout(request, timeout);
        const data = await this.handleResponse<TData>(response);

        await onSuccess?.(data);
        return data;

      } catch (error) {
        lastError = error as TError;

        if (attempt < attempts) {
          await onRetry?.(attempt, lastError);
          await this.delay(retry?.delay ?? 1000);
          continue;
        }

        await onError?.(lastError);
        throw lastError;
      }
    }

    throw lastError;
  }
}


export const apiHandler = new ApiHandler("https://zn4tfbui5k.execute-api.eu-west-2.amazonaws.com/dev/")





