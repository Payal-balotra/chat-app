import { User } from "./user.model";

export const userRegister = (phone: number) => {
  const user = User.create({ phone });
  return user;
};

export const userProfile = (userId: string, name: string, bio: string) => {
  const user = User.findByIdAndUpdate(userId, { name, bio });
  return user;
};
export const userCreateDirect = (
  phone: number,
  name: string,
  bio: string,
  isVerified: boolean,
) => {
  const user = User.create({ phone, name, bio, isVerified });
  return user;
};
export const findUserByPhone = (phone: number) => {
  const user = User.findOne({ phone });
  return user;
};
export const findUserById = (id: string) => {
  const user = User.findById(id);
  return user;
};
