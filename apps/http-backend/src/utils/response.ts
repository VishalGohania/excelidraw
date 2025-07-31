import { Response } from "express";

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

export const createResponse = (
  res: Response, 
  statusCode: number, 
  message: string, 
  data?: any
) => {
  const response: ApiResponse = {
    success: statusCode >= 200 && statusCode < 300,
    message,
  };

  if (data) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
}; 

export const json = (res: Response, data: any, message: string = "Success") => {
  return createResponse(res, 200, message, data);
};

export const unauthorized = (res: Response, message: string = "Unauthorized") => {
  return createResponse(res, 401, message);
};

export const serverError = (res: Response, message: string = "Internal Server Error") => {
  return createResponse(res, 500, message);
};

export const forbidden = (res: Response, message: string = "Forbidden") => {
  return createResponse(res, 403, message);
};
