import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config/config";

export const generateAccessToken = (id : string) => {
  const token = jwt.sign({id}, config.secretKey, {expiresIn: "7d"})
  return token;
};

// export const generateRefreshToken = (userId: string, role: Role) => {
//   return jwt.sign({ userId, role }, config.refreshToken, {
//     expiresIn: "7d",
//   });
// };

export const verifyJwtToken = (token: string) => {
  const decoded = jwt.verify(token, config.secretKey) as JwtPayload;
  return decoded;
};
// export const verifyRefreshToken = (token: string) => {
//   const decoded = jwt.verify(token, config.refreshToken) as JwtPayload;
//   return decoded;
// };
