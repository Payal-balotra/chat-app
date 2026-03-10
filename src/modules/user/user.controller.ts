import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { getUsers, updateUser, userCreateDirect, userProfile } from "./user.services";
import { errorResponse, response } from "../../utils/response";

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
export const updateProfile =  catchAsync(async(req:Request ,res :Response)=>{
  const data = req.body;
  const userId = req.params.id as string;
  if(!userId){
    return errorResponse(res,400,"Please provide userId");
  
    }
  console.log(data,"data");
  console.log(userId,"userId")
  const user = await updateUser(userId,data);
  return user;
})
export const getAllUsers = catchAsync(async(req : Request, res: Response)=>{
  const users = await getUsers();
  return response(res,200,"All Users",users)
})
