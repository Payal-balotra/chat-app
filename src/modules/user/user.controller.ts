import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { userCreateDirect, userProfile } from "./user.services";
import { response } from "../../utils/response";

export const createUser = catchAsync(async (req: Request, res: Response) => {
  const { phone, name } = req.body;
  const user = await userCreateDirect(phone, name);
  
  return response(res, 200, "user registered", user);
});
export const createProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id as string;

  const { name, bio } = req.body;
  const user = await userProfile(userId, name, bio);
  return response(res, 200, "user profile created", user);
});
