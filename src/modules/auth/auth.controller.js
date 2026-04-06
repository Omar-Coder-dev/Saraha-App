import { Router } from "express";
import * as authService from "./auth.service.js";
import { validation } from "../../middlewares/validation.middleware.js";
import {
  signupSchema,
  loginSchema,
  googleSignupSchema,
  logoutSchema,
} from "./auth.validation.js";
import { authentication } from "../../middlewares/auth.middleware.js";

const router = Router();
router.post("/signup", validation(signupSchema), async (req, res, next) => {
  try {
    res
      .status(201)
      .json({ msg: "done", data: await authService.signupService(req.body) });
  } catch (error) {
    next(error);
  }
});
router.post("/login", validation(loginSchema), async (req, res, next) => {
  try {
    res
      .status(200)
      .json({ msg: "done", data: await authService.loginService(req.body) });
  } catch (error) {
    next(error);
  }
});
router.post("/forget-password", async (req, res, next) => {
  try {
    res.json(await authService.forgetPasswordService(req.body.email));
  } catch (error) {
    next(error);
  }
});
router.post("/reset-password", async (req, res, next) => {
  try {
    res.json(await authService.resetPasswordService(req.body));
  } catch (error) {
    next(error);
  }
});
router.post("/refresh-token", async (req, res, next) => {
  try {
    res.json({
      msg: "done",
      data: await authService.refreshTokenService(req.headers.refreshtoken),
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/signup/gmail",
  validation(googleSignupSchema),
  async (req, res, next) => {
    try {
      const data = await authService.googleLoginService(req.body.idToken);
      res.status(200).json({ msg: "done", data });
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  "/logout",
  authentication,
  validation(logoutSchema),
  async (req, res) => {
    const data = await authService.logoutService({
      user: req.user,
      payload: req.authPayload,
      flag: req.body.flag,
    });
    res.status(200).json({ msg: "done", data });
  },
);

router.post("/confirm-email", async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    res.json(await authService.confirmEmailService({ email, otp }));
  } catch (error) {
    next(error);
  }
});

router.patch("/resend-otp", async (req, res, next) => {
  try {
    const { email } = req.body;
    res.json(await authService.resendOtpService(email));
  } catch (error) {
    next(error);
  }
});
export default router;
