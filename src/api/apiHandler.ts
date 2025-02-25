import { HTTPMethod } from '@/types/api';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosProgressEvent } from 'axios';

interface FetchRequest<T> {
  endpoint: string;
  method: HTTPMethod;
  headers?: Record<string, string>;
  body?: T;
  params?: Record<string, any>;
  config?: AxiosRequestConfig;
  retry?: number;
  delay?: number;
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
}

interface ApiResponse<R> extends AxiosResponse<R> {
  // Custom properties if needed
}

class ApiHandler {
  private axiosInstance: AxiosInstance;
  private defaultRetryCount: number;
  private defaultRetryDelay: number;

  constructor(baseURL: string, config?: AxiosRequestConfig) {
    this.axiosInstance = axios.create({
      baseURL,
      ...config,
    });

    this.defaultRetryCount = config?.maxRedirects || 3;
    this.defaultRetryDelay = 1000;

    this.axiosInstance.interceptors.request.use(
      (config) => {
        config.headers['Request-Start-Time'] = new Date().getTime();
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.axiosInstance.interceptors.response.use(
      (response) => {
        const requestStartTime = response.config.headers['Request-Start-Time'] as number;
        if (requestStartTime) {
          const responseTime = new Date().getTime() - requestStartTime;
          console.log(`API Request to ${response.config.url} took ${responseTime}ms`);
        }
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (error.code === 'ECONNABORTED' && originalRequest && !originalRequest._retryAttempt) {
          originalRequest._retryAttempt = 1;
          const retryCount = originalRequest.retry || this.defaultRetryCount;
          const delay = originalRequest.delay || this.defaultRetryDelay;

          while (originalRequest._retryAttempt <= retryCount) {
            console.log(`Request timeout, retrying attempt ${originalRequest._retryAttempt}/${retryCount} after ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            try {
              const response = await this.axiosInstance(originalRequest);
              return response;
            } catch (retryError: any) {
              console.error(`Retry attempt ${originalRequest._retryAttempt} failed:`, retryError.message);
              originalRequest._retryAttempt++;
              if (originalRequest._retryAttempt > retryCount) {
                console.error(`Max retry attempts reached for request: ${originalRequest.url}`);
                break;
              }
            }
          }
        }

        if (error.response) {
          console.error(`API Error for ${originalRequest.url}: Status ${error.response.status}`, error.response.data);
          return Promise.reject(error);
        } else if (error.request) {
          console.error(`No response for request to ${originalRequest.url}:`, error.request);
          return Promise.reject(new Error("ERR_NO_RESPONSE"));
        } else {
          console.error('Error setting up request:', error.message);
          return Promise.reject(error);
        }
      }
    );
  }

  public async fetch<R = any, T = any>(request: FetchRequest<T>): Promise<ApiResponse<R>> {
    const { endpoint, method, headers, body, params, config: requestConfig, onUploadProgress } = request;

    try {
      const response: ApiResponse<R> = await this.axiosInstance.request<R>({
        url: endpoint,
        method,
        headers,
        data: body,
        params,
        ...requestConfig,
        onUploadProgress,
      });
      return response;
    } catch (error: any) {
      throw error;
    }
  }
}

export default ApiHandler;


export const apiHandler = new ApiHandler(process.env.EXPO_PUBLIC_API_URL!)
