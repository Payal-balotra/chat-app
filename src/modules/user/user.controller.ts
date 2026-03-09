import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { getUsers, userCreateDirect, userProfile } from "./user.services";
import { response } from "../../utils/response";

export const createUser = catchAsync(async (req: Request, res: Response) => {
  const { phone, name, bio, isVerified } = req.body;
  const user = await userCreateDirect(phone, name, bio, isVerified);

  return response(res, 200, "user registered", user);
});
export const createProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id as string;

  const { name, bio } = req.body;
  const user = await userProfile(userId, name, bio);
  return response(res, 200, "user profile created", user);
});
export const getAllUsers = catchAsync(async(req : Request, res: Response)=>{
  const users = await getUsers();
  return response(res,200,"All Users",users)
})

// export const getUser = catchAsync(async(req : Request, res: Response)=>{
  
//   const user  = req.user ;
//   return user;
// })