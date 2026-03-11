import { HydratedDocument } from "mongoose";
import { IUser } from "../../modules/user/user.model";
declare global {
  namespace Express {
    interface Request {
      user: HydratedDocument<IUser>;
    }
  }
}
