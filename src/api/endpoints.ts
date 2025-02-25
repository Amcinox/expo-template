import { Endpoints, HTTPMethod } from "@/types/api";

export const endpoints: Endpoints = {
  auth: {
    login: {
      path: () => `/auth/login`,
      method: HTTPMethod.POST,
    },
    refresh: {
      path: () => `/auth/employee/refresh`,
      method: HTTPMethod.POST,
    },
    logout: {
      path: () => `/auth/employee/signout`,
      method: HTTPMethod.POST,

    }
  }
};
