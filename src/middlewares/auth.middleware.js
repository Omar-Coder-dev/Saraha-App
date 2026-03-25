import jwt from "jsonwebtoken";
import { userModel } from "../DB/models/user.model.js";
import { get , set } from "../DB/redis.services.js";

export const authentication = async (req, res, next) => {
  try {
    let token = req.headers.token || req.headers.authorization;
    if (token?.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }

    if (!token) return next(new Error("token required", { cause: { status: 401 } }));

    const payload = jwt.verify(token, process.env.TOKEN_SIGNITURE);

    const isBlacklisted = await get({ key: `blacklist:${payload.jti}` });
    if (isBlacklisted) {
      return next(new Error("This session has been logged out", { cause: { status: 401 } }));
    }

    const user = await userModel.findById(payload._id);
    if (!user) return next(new Error("user not found", { cause: { status: 404 } }));


    if (user.credentialsChangedAt) {
      const timeInSeconds = parseInt(user.credentialsChangedAt.getTime() / 1000);
      if (timeInSeconds > payload.iat) {
        return next(new Error("token expired or revoked, please login again", { cause: { status: 401 } }));
      }
    }

    req.user = user;
    req.authPayload = payload; 
    next();
  } catch (error) {
    next(new Error(error.message, { cause: { status: 401 } }));
  }
};

export const authorization = (accessRoles = []) => {
  return (req, res, next) => {
    if (!accessRoles.includes(req.user.role))
      return next(new Error("not authorized", { cause: { status: 403 } }));
    next();
  };
};
