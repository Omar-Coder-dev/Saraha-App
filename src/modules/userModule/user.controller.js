import { Router } from "express";
import {
  authentication,
  authorization,
} from "../../middlewares/auth.middleware.js";
import { Roles } from "../../DB/enum.js";
import { upload } from "../../middlewares/multer.middleware.js";
import { coverImagesService, profileImageService } from "./user.service.js";
import { profileImageSchema } from "./user.validation.js";
import { validation } from "../../middlewares/validation.middleware.js";
const router = Router();
router.get(
  "/profile",
  authentication,
  authorization([Roles.user, Roles.admin]),
  (req, res) => {
    res.json({ msg: "done", data: req.user });
  },
);

router.get("/image", upload().single("image"), (req, res) => {
  res.json({ msg: "done", data: req.file });
});

router.patch(
  "/profile-image",
  authentication,
  upload({ dest: "users/profileImages" }).single("image"),
  async (req, res) => {
    console.log({ file: req.file });

    await profileImageService({ path: req.file.finalPath, user: req.user });
    res.json({ msg: "done", data: req.file });
  },
);

router.patch("/cover-images",authentication , upload({ dest: "users/coverImages" }).array("coverImages",4),
   validation(profileImageSchema),
   async (req,res,next)=>{
    const paths = req.files.map(ele=>ele.finalPath);
    console.log({paths})
    await coverImagesService({user:req.user,paths});
    res.json({msg:"done",data:req.files})
})
export default router;
