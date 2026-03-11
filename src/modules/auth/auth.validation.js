import Joi from "joi";
import { Gender } from "../../DB/enum.js";
const phoneRegex = /^01[0125][0-9]{8}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
export const signupSchema = Joi.object({
  firstName: Joi.string().min(2).max(20).required(),
  lastName: Joi.string().min(2).max(20).required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(passwordRegex).required().messages({
    "string.pattern.base":
      "Password must contain at least one letter and one digit.",
  }),
  phone: Joi.string().pattern(phoneRegex).required().messages({
    "string.pattern.base":
      "Phone number must be a valid Egyptian mobile number.",
  }),
  gender: Joi.number().valid(...Object.values(Gender)),
  role: Joi.number().valid(0, 1),
});
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const googleSignupSchema = Joi.object({
  idToken: Joi.string().required(),
});
