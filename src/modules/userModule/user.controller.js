import { Router } from "express";
import {
  authentication,
  authorization,
} from "../../middlewares/auth.middleware.js";
import { Roles } from "../../DB/enum.js"; 

const router = Router();
router.get(
  "/profile",
  authentication,
  authorization([Roles.user, Roles.admin]),
  (req, res) => {
    res.json({ msg: "done", data: req.user });
  },
);
export default router;
