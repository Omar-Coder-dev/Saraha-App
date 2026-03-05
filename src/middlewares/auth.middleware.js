import jwt from "jsonwebtoken";
import { userModel } from "../DB/models/user.model.js";

export const authentication = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token)
      return next(new Error("token required", { cause: { status: 401 } }));
    const payload = jwt.verify(token, process.env.TOKEN_SIGNITURE);
    const user = await userModel.findById(payload._id);
    if (!user)
      return next(new Error("user not found", { cause: { status: 404 } }));
    req.user = user;
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