import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";

const baseURL = import.meta.env.VITE_API_URL;

const axiosFacade = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true,
});

axiosFacade.interceptors.response.use(
  <T>(response: AxiosResponse<T>): T => response.data,
  (error) => Promise.reject(error),
);

interface AxiosFacade {
  <T>(config: AxiosRequestConfig): Promise<T>;
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T>;
}

export default axiosFacade as AxiosFacade;
