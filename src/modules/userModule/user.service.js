import { userModel } from "../../DB/models/user.model.js";
import * as repo from "../../DB/db.repo.js";
import { encryption } from "../../utils/security/encryption.js";
import { hash } from "../../utils/security/hash.js";

export const findByEmail = async (email) => {
  return await repo.findOne({
    model: userModel,
    query: { email: email.toLowerCase() },
  });
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
