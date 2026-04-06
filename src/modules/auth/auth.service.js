import jwt from "jsonwebtoken";
import { compare, hash, generateOTP } from "../../utils/hash.js"; //
import { encryption } from "../../utils/security/encryption.js";
import { userModel } from "../../DB/models/user.model.js";
import { sendEmail } from "../../utils/email.js";
import * as repo from "../../DB/db.repo.js";
import crypto from "crypto";
import { Logout } from "../../DB/enum.js";
import { set, get, deleteByKey } from "../../DB/redis.services.js";
import { redisClient } from "../../DB/redis.connection.js";

export const signupService = async (data) => {
  data.password = await hash({ plainText: data.password });
  data.phone = encryption(data.phone);

  const user = await repo.create({ model: userModel, data });

  const code = generateOTP();
  // Set to 300 (5 minutes)
  await set({ key: `confirm:${data.email}`, value: code, ttl: 300 });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #333; text-align: center;">Welcome to Saraha!</h2>
      <p>Thank you for signing up. Please use the verification code below to activate your account. This code is valid for <b>5 minutes</b>.</p>
      <div style="background: #f0f7ff; padding: 20px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #007bff; border-radius: 8px; margin: 20px 0;">
        ${code}
      </div>
      <p style="font-size: 13px; color: #666; text-align: center;">If you didn't create an account, please ignore this email.</p>
    </div>
  `;

  await sendEmail({ to: data.email, subject: "Confirm Your Email", html });

  return user;
};

export const loginService = async ({ email, password }) => {
  const user = await repo.findOne({ model: userModel, query: { email } });

  if (!user) {
    throw new Error("invalid credentials", { cause: { status: 401 } });
  }

  if (!user.isVerified) {
    throw new Error("Please verify your email first", {
      cause: { status: 401 },
    });
  }
  const isMatch = await compare({ cypherText: user.password, text: password });

  if (!isMatch) {
    throw new Error("invalid credentials", { cause: { status: 401 } });
  }
  const jwtid = crypto.randomUUID();
  const accessToken = jwt.sign(
    { _id: user._id, role: user.role },
    process.env.TOKEN_SIGNITURE,
    { expiresIn: "1h", jwtid },
  );
  const refreshToken = jwt.sign(
    { _id: user._id, role: user.role },
    process.env.REFRESH_TOKEN_SIGNITURE,
    { expiresIn: "7d", jwtid },
  );
  return { accessToken, refreshToken };
};

export const forgetPasswordService = async (email) => {
  const user = await repo.findOne({ model: userModel, query: { email } });
  if (!user) throw new Error("user not found", { cause: { status: 404 } });

  const code = generateOTP();

  // 1. Save to Redis (10 minutes)
  await set({ key: `otp:${email}`, value: code, ttl: 600 });

  // 2. The Email Template
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
      <p>Hello,</p>
      <p>We received a request to reset your password. Use the code below to proceed. This code expires in 10 minutes.</p>
      <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #007bff; border-radius: 5px; margin: 20px 0;">
        ${code}
      </div>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #888; text-align: center;">Saraha App Team</p>
    </div>
  `;

  await sendEmail({ to: email, subject: "Password Reset Code", html });
  return { msg: "otp sent" };
};

export const resetPasswordService = async ({ email, otp, newPassword }) => {
  // Check Redis instead of User document
  const storedOtp = await get({ key: `otp:${email}` });

  if (!storedOtp || storedOtp !== otp) {
    throw new Error("invalid or expired otp", { cause: { status: 400 } });
  }

  const user = await repo.findOne({ model: userModel, query: { email } });
  if (!user) throw new Error("user not found", { cause: { status: 404 } });

  // Update password and save
  user.password = await hash({ plainText: newPassword });
  await user.save({ validateBeforeSave: false });

  // Delete the OTP from Redis immediately after use
  await deleteByKey({ key: `otp:${email}` });

  return { msg: "success" };
};

export const refreshTokenService = async (token) => {
  const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SIGNITURE);
  const user = await repo.findById({ model: userModel, id: payload._id });
  if (!user) throw new Error("user not found", { cause: { status: 404 } });
  return jwt.sign(
    { _id: user._id, role: user.role },
    process.env.TOKEN_SIGNITURE,
    { expiresIn: "1h" },
  );
};

export const googleLoginService = async (idToken) => {
  const decoded = jwt.decode(idToken);
  const { email, given_name, family_name } = decoded;

  let user = await repo.findOne({ model: userModel, query: { email } });

  if (!user) {
    const randomPassword = crypto.randomBytes(32).toString("hex");
    const hashedPassword = await hash({ plainText: randomPassword });
    user = await repo.create({
      model: userModel,
      data: {
        firstName: given_name,
        lastName: family_name || " ",
        email,
        provider: 1,
        password: hashedPassword,
        isVerified: true,
      },
    });
  }

  const accessToken = jwt.sign(
    { _id: user._id, role: user.role },
    process.env.TOKEN_SIGNITURE,
    { expiresIn: "1h" },
  );

  return { accessToken };
};

export const logoutService = async ({ user, payload, flag = Logout.all }) => {
  if (flag === Logout.all) {
    user.credentialsChangedAt = Date.now();
    await user.save();
  } else if (flag === Logout.current) {
    const timeLeft = Math.floor(payload.exp - Date.now() / 1000);

    await set({
      key: `blacklist:${payload.jti}`,
      value: "true",
      ttl: timeLeft > 0 ? timeLeft : 3600,
    });
  }

  return { data: {} };
};

export const confirmEmailService = async ({ email, otp }) => {
  // 1. Get from Redis
  const storedOtp = await get({ key: `confirm:${email}` });

  if (!storedOtp || storedOtp !== otp) {
    throw new Error("invalid or expired confirmation code", {
      cause: { status: 400 },
    });
  }

  // 2. Update MongoDB status using the model directly
  const user = await userModel.findOneAndUpdate(
    { email },
    { isVerified: true },
    { new: true }, // This returns the updated document
  );

  if (!user) throw new Error("user not found", { cause: { status: 404 } });

  // 3. Clean Redis
  await deleteByKey({ key: `confirm:${email}` });

  return { msg: "account verified successfully" };
};

export const resendOTP = async (email) => {
  const user = await userModel.findOne({ email });
  if (!user) throw new Error("User not found", { cause: 404 });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Save to Redis
  await redisClient.set(`confirm:${email}`, otp, "EX", 300);
  // FIX: Wrap the arguments in an object { to, subject, html }
  await sendEmail({
    to: email,
    subject: "Your New OTP",
    html: `<b>Your code is: ${otp}</b>`,
  });

  return { msg: "New OTP sent to your email" };
};
