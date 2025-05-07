import { Endpoints, HTTPMethod } from "@/types/api";
import { toQuery } from "@/utils/format-string";

export const endpoints: Endpoints = {
  auth: {
    login: {
      path: () => `/auth/login`,
      method: HTTPMethod.POST,
    },
    refresh: {
      path: () => `/auth/refresh`,
      method: HTTPMethod.POST,
    },
    logout: {
      path: () => `/auth/signout`,
      method: HTTPMethod.POST,
    },
    userExists: {
      path: () => `/auth/userexist`,
      method: HTTPMethod.POST
    },
    forgotPassword: {
      path: () => `/auth/forgot-password`,
      method: HTTPMethod.POST
    },
    confirmForgotPassword: {
      path: () => `/auth/confirm-password`,
      method: HTTPMethod.POST
    },
    changePassword: {
      path: () => `/auth/change-password`,
      method: HTTPMethod.POST
    }
  },
  customer: {
    verify_otp: {
      path: () => `/customer/otp`,
      method: HTTPMethod.POST,
    },
    create_customer: {
      path: () => `/customer`,
      method: HTTPMethod.POST,
    },
    update_customer: {
      path: () => `/customer`,
      method: HTTPMethod.PUT,
    },

    verify_customer: {
      path: () => `/customer/verify`,
      method: HTTPMethod.POST,
    },
    get_customer: {
      path: () => `/customer/otp`,
      method: HTTPMethod.GET
    }
  }
};



export const static_pages = {
  terms_and_conditions: process.env.EXPO_PUBLIC_API_URL + "/terms-of-service",
  privacy_policy: process.env.EXPO_PUBLIC_API_URL + "/privacy-policy"
}