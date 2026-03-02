import { Response } from "express";

export const response = (
  res: Response,
  statusCode: number,
  message: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
) => {
  return res.status(statusCode).json({
    success: true,
    message: message,
    data: data || [],
  });
};

export const errorResponse = (
  res: Response,
  statusCode: number,
  message: string,
) => {
  return res.status(statusCode).json({
    success: false,
    message: message,
  });
};
