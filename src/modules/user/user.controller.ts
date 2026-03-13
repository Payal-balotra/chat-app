import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import {
  findUserById,
  findUserByPhone,
  getUsers,
  updateUser,
  userCreateDirect,
  userProfile,
} from "./user.services";
import { errorResponse, response } from "../../utils/response";
import { User } from "./user.model";

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
export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;
  const userId = req.params.id as string;
  if (!userId) {
    return errorResponse(res, 400, "Please provide userId");
  }

  const user = await updateUser(userId, data);
  return response(res, 200, "user profile updated", user);
});
export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await getUsers();
  return response(res, 200, "All Users", users);
});

export const addContact = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const phone = req.body.phone;
  // check already a member or not

  const contactUser = await findUserByPhone(phone);
  if (!contactUser) {
    return errorResponse(res, 404, "User Not Registered");
  }
  const alreadyMember = user.contacts.includes(contactUser._id);
  if (alreadyMember) {
    return errorResponse(res, 400, "Already in contact list ");
  }
  user.contacts.push(contactUser._id);
  await user.save();

  return response(res, 201, "Contact added successfully !", user);
});

export const getContacts = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  const data = await User.findById(user.id).populate("contacts", "name phone");
  return response(res, 200, "Contacts", data);
});

export const deleteContact = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id as string;
  const result = await User.updateOne(
    { _id: req.user.id },
    { $pull: { contacts: userId } },
  );
  return response(res, 200, "Contact deleted successfully", result);
});
