import { NextFunction, Request, Response } from "express";
import { twilioClient } from "../config/twilio";
import { errorResponse } from "../utils/response";

export const numberValidation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const phone = req.body;

  const phoneNumber = await twilioClient.lookups.v2.phoneNumbers(phone).fetch();
  if (phoneNumber.valid) {
    next();
  } else {
    return errorResponse(res, 422, "invalid phone number");
  }
};
