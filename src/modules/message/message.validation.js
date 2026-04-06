import Joi from "joi";

export const sendMessageSchema = Joi.object({
  content: Joi.string().min(1).max(500).required(),
  receiverId: Joi.string().length(24).hex().required() 
});