import { messageModel } from "../../DB/models/message.model.js";
import { userModel } from "../../DB/models/user.model.js";

export const sendMessageService = async ({ content, receiverId }) => {
  // 1. Check if the receiver actually exists in the database
  const receiver = await userModel.findById(receiverId);
  if (!receiver) {
    throw new Error("Receiver not found", { cause: { status: 404 } });
  }

  // 2. Create the anonymous message
  const newMessage = await messageModel.create({ content, receiverId });

  return { msg: "Message sent successfully", message: newMessage };
};

export const getMessagesService = async (user) => {
  // 1. Find all messages belonging to this user
  const messages = await messageModel.find({ receiverId: user._id });

  // 2. Return the list (or an empty list if they have no fans yet)
  return { messages };
};