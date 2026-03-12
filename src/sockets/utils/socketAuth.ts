import { Socket } from "socket.io";
import { verifyJwtToken } from "../../lib/jwt";
import { findUserById } from "../../modules/user/user.services";

export const socketAuth = async (socket : Socket,   next: (err?: Error) => void) => {

  try {
    const authHeader = socket.handshake.headers.authorization;

    if (!authHeader) {
      return next(new Error("Authorization missing"));``
    }

    const token = authHeader.split(" ")[1];

    const decoded = await verifyJwtToken(token);

    socket.data.userId = decoded.id;
    socket.data.user = await findUserById(decoded.id);

    next();

  } catch (err) {
    next(new Error("Invalid token"));
  }
};