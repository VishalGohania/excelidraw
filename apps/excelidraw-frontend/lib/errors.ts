export interface HttpError extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export function isHttpError(error: unknown): error is HttpError {
  return error instanceof Error && 'response' in error;
}

export function getErrorMessage(error: unknown): string {
  if (isHttpError(error)) {
    return error.response?.data?.message || "An unexpected error occurred";
  }
  return "An unexpected error occurred";
}
