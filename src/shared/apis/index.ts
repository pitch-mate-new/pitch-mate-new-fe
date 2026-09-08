import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type Method,
} from "axios";

const DEFAULT_TIMEOUT_MS = 10_000;
const AUTH_REISSUE_PATH = "/auth/reissue";
const LOGIN_PATH = "/login";
const AUTH_REDIRECT_MESSAGE_KEY = "authRedirectMessage";
const AUTH_EXPIRED_MESSAGE = "인증 정보가 만료되어 다시 로그인해주세요.";
const AUTH_BYPASS_PATHS = new Set([
  "/auth/login",
  "/auth/signup",
  AUTH_REISSUE_PATH,
]);

export type ApiRequestConfig<TData = unknown> = AxiosRequestConfig<TData>;
export type ApiContentType = "json" | "form-data";
export type ApiConfig<TData = unknown> = ApiRequestConfig<TData> & {
  contentType?: ApiContentType;
};
export interface ApiResponse<TResult = unknown> {
  code: number;
  status: number;
  message: string;
  result: TResult;
}

interface ApiErrorResponse {
  code?: number;
  status?: number;
  message?: string;
  [key: string]: unknown;
}

const AUTH_ERROR_CODE = {
  INVALID_TOKEN: 4004,
  EXPIRED_REFRESH_TOKEN: 4005,
} as const;

interface ReissueResult {
  accessToken: string;
  refreshToken: string;
  userId: number;
  nickname: string;
  role: string;
}

export class ApiError extends Error {
  code: number;
  status: number;
  payload?: unknown;

  constructor({
    message,
    code,
    status,
    payload,
    cause,
  }: {
    message: string;
    code: number;
    status: number;
    payload?: unknown;
    cause?: unknown;
  }) {
    super(message, { cause });
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.payload = payload;
  }
}

type ApiMethodConfig<TData = unknown> = Omit<
  ApiConfig<TData>,
  "url" | "method"
>;

const PRODUCTION_API_BASE_URL = "https://3-34-15-241.nip.io/api";
const baseURL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.PROD ? PRODUCTION_API_BASE_URL : "");

export const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  timeout: DEFAULT_TIMEOUT_MS,
});

let reissuePromise: Promise<ReissueResult> | null = null;

const clearAuthStorage = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem("accessToken");
  window.localStorage.removeItem("refreshToken");
  window.localStorage.removeItem("userRole");
};

export const setAuthRedirectMessage = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    AUTH_REDIRECT_MESSAGE_KEY,
    AUTH_EXPIRED_MESSAGE,
  );
};

export const consumeAuthRedirectMessage = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const message = window.sessionStorage.getItem(AUTH_REDIRECT_MESSAGE_KEY);
  window.sessionStorage.removeItem(AUTH_REDIRECT_MESSAGE_KEY);

  return message;
};

const redirectToLogin = () => {
  if (
    typeof window === "undefined" ||
    window.location.pathname === LOGIN_PATH
  ) {
    return;
  }

  setAuthRedirectMessage();
  window.location.replace(LOGIN_PATH);
};

const saveReissuedAuth = ({
  accessToken,
  refreshToken,
  role,
}: ReissueResult) => {
  window.localStorage.setItem("accessToken", accessToken);
  window.localStorage.setItem("refreshToken", refreshToken);
  window.localStorage.setItem("userRole", role);
};

const reissueTokens = async (refreshToken: string) => {
  const response = await axiosInstance.post<
    ApiResponse<ReissueResult>,
    AxiosResponse<ApiResponse<ReissueResult>>,
    { refreshToken: string }
  >(AUTH_REISSUE_PATH, { refreshToken });

  return response.data.result;
};

const getReissuePromise = (refreshToken: string) => {
  reissuePromise ??= reissueTokens(refreshToken).finally(() => {
    reissuePromise = null;
  });

  return reissuePromise;
};

const stripTrailingSlash = (path: string): string =>
  path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;

const getRequestPathname = (url?: string): string => {
  if (!url) {
    return "";
  }

  try {
    return stripTrailingSlash(new URL(url, window.location.origin).pathname);
  } catch {
    return stripTrailingSlash(url.split("?")[0] ?? "");
  }
};

const shouldBypassAuth = (url?: string): boolean =>
  AUTH_BYPASS_PATHS.has(getRequestPathname(url));

const getApiErrorCode = (error: unknown): number | undefined => {
  if (error instanceof ApiError) {
    return error.code;
  }

  if (!axios.isAxiosError(error)) {
    return undefined;
  }

  const data = error.response?.data as ApiErrorResponse | undefined;

  return data?.code;
};

export const isRefreshTokenAuthFailure = (error: unknown): boolean => {
  const code = getApiErrorCode(error);

  if (
    code === AUTH_ERROR_CODE.INVALID_TOKEN ||
    code === AUTH_ERROR_CODE.EXPIRED_REFRESH_TOKEN
  ) {
    return true;
  }

  if (error instanceof ApiError) {
    return error.status === 401;
  }

  return axios.isAxiosError(error) && error.response?.status === 401;
};

const shouldRedirectToLogin = (error: ApiError, url?: string): boolean => {
  if (shouldBypassAuth(url)) {
    return false;
  }

  return (
    error.status === 401 ||
    error.status === 403 ||
    error.code === AUTH_ERROR_CODE.INVALID_TOKEN ||
    error.code === AUTH_ERROR_CODE.EXPIRED_REFRESH_TOKEN
  );
};

const shouldAttemptReissue = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  const code = getApiErrorCode(error);

  if (code === AUTH_ERROR_CODE.EXPIRED_REFRESH_TOKEN) {
    return false;
  }

  return (
    error.response?.status === 401 ||
    error.response?.status === 403 ||
    code === AUTH_ERROR_CODE.INVALID_TOKEN
  );
};

axiosInstance.interceptors.request.use((config) => {
  if (shouldBypassAuth(config.url) || typeof window === "undefined") {
    return config;
  }

  const accessToken = window.localStorage.getItem("accessToken");

  if (!accessToken) {
    return config;
  }

  config.headers = config.headers ?? {};
  config.headers.Authorization = accessToken.startsWith("Bearer ")
    ? accessToken
    : `Bearer ${accessToken}`;

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      !axios.isAxiosError(error) ||
      !shouldAttemptReissue(error) ||
      !error.config ||
      shouldBypassAuth(error.config.url) ||
      error.config.headers?.["X-Auth-Retry"] === "true"
    ) {
      throw error;
    }

    if (typeof window === "undefined") {
      throw error;
    }

    const refreshToken = window.localStorage.getItem("refreshToken");

    if (!refreshToken) {
      clearAuthStorage();
      redirectToLogin();
      throw error;
    }

    try {
      const auth = await getReissuePromise(refreshToken);
      saveReissuedAuth(auth);

      error.config.headers = error.config.headers ?? {};
      error.config.headers.Authorization = auth.accessToken.startsWith(
        "Bearer ",
      )
        ? auth.accessToken
        : `Bearer ${auth.accessToken}`;
      error.config.headers["X-Auth-Retry"] = "true";

      return axiosInstance.request(error.config);
    } catch (reissueError) {
      if (isRefreshTokenAuthFailure(reissueError)) {
        clearAuthStorage();
        redirectToLogin();
      }

      throw reissueError;
    }
  },
);

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    const status = data?.status ?? error.response?.status ?? 0;
    const code = data?.code ?? status;
    const message = data?.message ?? error.message;

    return new ApiError({
      message,
      code,
      status,
      payload: data,
      cause: error,
    });
  }

  if (error instanceof Error) {
    return new ApiError({
      message: error.message,
      code: 0,
      status: 0,
      payload: error,
      cause: error,
    });
  }

  return new ApiError({
    message: "Unknown error occurred.",
    code: 0,
    status: 0,
    payload: error,
  });
};

const request = async <TResult = unknown, TData = unknown>(
  config: ApiConfig<TData>,
): Promise<ApiResponse<TResult>> => {
  const { contentType = "json", headers, ...requestConfig } = config;
  const resolvedHeaders = {
    ...(headers ?? {}),
  } as Record<string, unknown>;
  const hasContentTypeHeader = Object.keys(resolvedHeaders).some(
    (key) => key.toLowerCase() === "content-type",
  );

  if (contentType === "form-data") {
    // Let the browser set multipart boundary automatically.
    delete resolvedHeaders["Content-Type"];
    delete resolvedHeaders["content-type"];
  } else if (!hasContentTypeHeader) {
    resolvedHeaders["Content-Type"] = "application/json";
  }

  try {
    const response = await axiosInstance.request<
      ApiResponse<TResult>,
      AxiosResponse<ApiResponse<TResult>>,
      TData
    >({
      ...requestConfig,
      headers: resolvedHeaders as AxiosRequestConfig<TData>["headers"],
    });

    return response.data;
  } catch (error) {
    const apiError = toApiError(error);

    if (shouldRedirectToLogin(apiError, requestConfig.url)) {
      clearAuthStorage();
      redirectToLogin();
    }

    throw apiError;
  }
};

const requestByMethod = <TResult = unknown, TData = unknown>(
  method: Method,
  url: string,
  config?: ApiMethodConfig<TData>,
): Promise<ApiResponse<TResult>> =>
  request<TResult, TData>({
    ...config,
    method,
    url,
  });

export const apiInstance = {
  request,

  get: <TResult = unknown, TParams = unknown>(
    url: string,
    config?: ApiMethodConfig<never> & { params?: TParams },
  ) => requestByMethod<TResult, never>("GET", url, config),

  post: <TResult = unknown, TBody = unknown>(
    url: string,
    data?: TBody,
    config?: ApiMethodConfig<TBody>,
  ) => requestByMethod<TResult, TBody>("POST", url, { ...config, data }),

  put: <TResult = unknown, TBody = unknown>(
    url: string,
    data?: TBody,
    config?: ApiMethodConfig<TBody>,
  ) => requestByMethod<TResult, TBody>("PUT", url, { ...config, data }),

  patch: <TResult = unknown, TBody = unknown>(
    url: string,
    data?: TBody,
    config?: ApiMethodConfig<TBody>,
  ) => requestByMethod<TResult, TBody>("PATCH", url, { ...config, data }),

  delete: <TResult = unknown, TBody = unknown>(
    url: string,
    config?: ApiMethodConfig<TBody>,
  ) => requestByMethod<TResult, TBody>("DELETE", url, config),

  head: <TResult = unknown>(url: string, config?: ApiMethodConfig<never>) =>
    requestByMethod<TResult, never>("HEAD", url, config),

  options: <TResult = unknown>(url: string, config?: ApiMethodConfig<never>) =>
    requestByMethod<TResult, never>("OPTIONS", url, config),
};

export default apiInstance;
