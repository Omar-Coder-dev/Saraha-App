import { Router } from "express";
import * as messageService from "./message.service.js";
import { authentication } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const { content, receiverId } = req.body;
    res.status(201).json(await messageService.sendMessageService({ content, receiverId }));
  } catch (error) {
    next(error);
  }
});

// 2. Get My Messages (Private - TOKEN REQUIRED)
router.get("/", authentication, async (req, res, next) => {
  try {
    // The 'authentication' middleware puts the user object in 'req.user'
    res.json(await messageService.getMessagesService(req.user));
  } catch (error) {
    next(error);
  }
});

export default router;