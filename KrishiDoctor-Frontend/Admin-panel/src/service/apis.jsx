const BASE_URL = "http://localhost:3001/api";

export const endpoints = {
  SENDOTP_API: BASE_URL + "/auth/sendotp",
  SIGNUP_API: BASE_URL + "/auth/register",
  LOGIN_API: BASE_URL + "/auth/login",
  ADD_ADDRESS_API: BASE_URL + "/auth/addAddress",
  GET_ALL_ADDRESS_API: BASE_URL + "/auth/getAllAddress",

  GET_ALL_USERS_API: BASE_URL + "/auth/getAllUsers",
  GET_USER_DETAILS_API: BASE_URL + "/auth/users/",
};

export const usersendpoints = {
  GET_ALL_USER_API: BASE_URL + "/main/user/users",
};

export const company = {
  GET_ALL_COMPANY_API: BASE_URL + "/main/companies",

  ADD_COMPANY_API: BASE_URL + "/main/companies",
};

// http://localhost:3001/api/main/companies
