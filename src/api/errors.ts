import axios, { AxiosError } from "axios";

export interface AppError {
  status?: number;
  code: string;
  message: string;
  details?: unknown;
  raw?: unknown;
}

const DEFAULT_ERROR_CODE = "UNKNOWN_ERROR";
const DEFAULT_ERROR_MESSAGE = "Unexpected error occurred";

function getAxiosMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;

  const maybe = data as {
    message?: unknown;
    error?: unknown;
  };

  if (typeof maybe.message === "string" && maybe.message.trim()) {
    return maybe.message;
  }

  if (typeof maybe.error === "string" && maybe.error.trim()) {
    return maybe.error;
  }

  return undefined;
}

function getAxiosCode(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;

  const maybe = data as {
    code?: unknown;
    errorCode?: unknown;
  };

  if (typeof maybe.code === "string" && maybe.code.trim()) {
    return maybe.code;
  }

  if (typeof maybe.errorCode === "string" && maybe.errorCode.trim()) {
    return maybe.errorCode;
  }

  return undefined;
}

export function toAppError(error: unknown): AppError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const responseData = axiosError.response?.data;
    const status = axiosError.response?.status;

    return {
      status,
      code:
        getAxiosCode(responseData) ||
        axiosError.code ||
        (status ? `HTTP_${status}` : DEFAULT_ERROR_CODE),
      message:
        getAxiosMessage(responseData) ||
        axiosError.message ||
        DEFAULT_ERROR_MESSAGE,
      details:
        responseData && typeof responseData === "object"
          ? (responseData as { details?: unknown }).details
          : undefined,
      raw: error,
    };
  }

  if (error instanceof Error) {
    return {
      code: error.name || DEFAULT_ERROR_CODE,
      message: error.message || DEFAULT_ERROR_MESSAGE,
      raw: error,
    };
  }

  if (typeof error === "string") {
    return {
      code: DEFAULT_ERROR_CODE,
      message: error,
      raw: error,
    };
  }

  return {
    code: DEFAULT_ERROR_CODE,
    message: DEFAULT_ERROR_MESSAGE,
    raw: error,
  };
}
