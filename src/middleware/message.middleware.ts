import { NextFunction, Request, Response } from "express";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { errorResponse } from "../utils/response";

export const numberValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { phone } = req.body;

  if (!phone) {
    return errorResponse(res, 400, "Phone number is required");
  }

  const phoneNumber = parsePhoneNumberFromString(phone);

  if (!phoneNumber || !phoneNumber.isValid()) {
    return errorResponse(res, 422, "Invalid phone number");
  }

  // normalize phone number
  req.body.phone = phoneNumber.number;

  next();
};