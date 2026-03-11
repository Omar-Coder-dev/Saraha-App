import { userModel } from "../../DB/models/user.model.js";
import * as repo from "../../DB/db.repo.js";
import fs from "fs/promises";
import { resolve } from "path";
export const findByEmail = async (email) => {
  return await repo.findOne({
    model: userModel,
    query: { email: email.toLowerCase() },
  });
};

export const profileImageService = async ({ user, path }) => {
  if (user.profileImage) {
    await fs.unlink(user.profileImage);
  }
  await userModel.updateOne({ _id: user._id }, { profileImage: path });
  return { data: {} };
};

export const coverImagesService = async ({ user, paths }) => {

  await userModel.updateOne({ _id: user._id }, { $addToSet: { coverImages: paths } });
  return { data: {} };
};

// export const updateProfileService = async (userId, updateData) => {
//   if (updateData.phone) {
//     updateData.phone = encryption(updateData.phone);
//   }
//   if (updateData.password) {
//     updateData.password = await hash({ plainText: updateData.password });
//   }
//   return await repo.findByIdAndUpdate({
//     model: userModel,
//     id: userId,
//     data: updateData,
//   });
// };

// export const deleteAccountService = async (userId) => {
//   return await userModel.findByIdAndDelete(userId);
// };
