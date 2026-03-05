import Joi from "joi";
import { Gender } from "../../DB/enum.js"; //
export const signupSchema = Joi.object({
  firstName: Joi.string().min(2).max(20).required(),
  lastName: Joi.string().min(2).max(20).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().required(),
  gender: Joi.number().valid(...Object.values(Gender)),
  role: Joi.number().valid(0, 1)
});
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const googleSignupSchema = Joi.object({
    idToken: Joi.string().required()
});