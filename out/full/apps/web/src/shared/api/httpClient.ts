import axios, { AxiosError } from "axios";

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000",
  withCredentials: true,
  timeout: 10000
});

httpClient.interceptors.request.use((config) => {
  // Reserved for future auth headers if needed.
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.code === "ECONNABORTED") {
      // Optionally log or send to monitoring here.
    }

    if (error.response?.status === 401) {
      // Optionally trigger a global sign-out / redirect.
    }

    return Promise.reject(error);
  }
);

