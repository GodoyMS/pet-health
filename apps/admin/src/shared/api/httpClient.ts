import axios, { AxiosError } from "axios";

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000",
  withCredentials: true,
  timeout: 15000
});

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => Promise.reject(error)
);

/** Extract a human-readable message from a failed API call. */
export function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string | string[] }
      | undefined;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message.join(", ") : data.message;
    }
    return error.message;
  }
  return error instanceof Error ? error.message : "Unexpected error";
}
