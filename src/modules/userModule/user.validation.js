import Joi from "joi";
import { fileTypes } from "../../middlewares/multer.middleware.js";

export const profileImageSchema = {
  fieldname: Joi.string().valid("image").required(),
  originalname: Joi.string().required(),
  encoding: Joi.string().required(),
  mimetype: Joi.string().valid(...fileTypes.image).required(),
  finalPath: Joi.string().required(),
  destination: Joi.string().required(),
  filename: Joi.string().required(),
  path: Joi.string().required(),
  size: Joi.number().required(),
};