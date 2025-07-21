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