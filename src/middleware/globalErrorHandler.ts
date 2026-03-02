import { NextFunction, Request, Response } from "express";

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any,
  req: Request,
  res: Response,
) => {
  console.log("inside global error handler");

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.log(statusCode);

  res.status(statusCode).json({
    success: false,
    message: error.message || "Internal Server Error",
  });
};
