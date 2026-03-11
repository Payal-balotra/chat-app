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
export const findUserByPhone = async(phone: any) => {
  const user = await User.findOne({ phone });
  return user;
};
export const findUserById = async (id: string) => {
  const user = await User.findById(id);
  return user;  
};

export const getUsers = () =>{
  const users = User.find({});
  return users
}

export const updateUser = async(id: string, data: any)=>{
  const user = User.findByIdAndUpdate(id,data);
  return user;
}
