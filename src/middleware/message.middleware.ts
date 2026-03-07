import { NextFunction, Request, Response } from "express";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { errorResponse } from "../utils/response";

export const numberValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { phone } = req.body;

  if (!phone) {
    return errorResponse(res, 400, "Phone number is required");
  }

  phone = phone.toString().trim();

  const parsed = parsePhoneNumberFromString(phone, "IN");

  if (!parsed || !parsed.isValid()) {
    return errorResponse(res, 422, "Invalid phone number");
  }

  req.body.phone = parsed.format("E.164");

  next();
};