import jwt from "jsonwebtoken";
import { compare, hash, generateOTP } from "../../utils/hash.js"; //
import { encryption } from "../../utils/security/encryption.js";
import { userModel } from "../../DB/models/user.model.js";
import { sendEmail } from "../../utils/email.js";
import * as repo from "../../DB/db.repo.js";
import crypto from "crypto";
import { Logout } from "../../DB/enum.js";
import { set } from "../../DB/redis.services.js";

export const signupService = async (data) => {
  data.password = await hash({ plainText: data.password });
  data.phone = encryption(data.phone);
  return await repo.create({ model: userModel, data });
};

export const loginService = async ({ email, password }) => {
  const user = await repo.findOne({ model: userModel, query: { email } });

  if (!user) {
    throw new Error("invalid credentials", { cause: { status: 401 } });
  }
  const isMatch = await compare({ cypherText: user.password, text: password });
  
  if (!isMatch) {
    throw new Error("invalid credentials", { cause: { status: 401 } });
  }
  const jwtid = crypto.randomUUID()
  const accessToken = jwt.sign(
    { _id: user._id, role: user.role },
    process.env.TOKEN_SIGNITURE,
    { expiresIn: "1h" , jwtid },
  );
  const refreshToken = jwt.sign(
    { _id: user._id, role: user.role },
    process.env.REFRESH_TOKEN_SIGNITURE,
    { expiresIn: "7d" , jwtid  },
  );
  return { accessToken, refreshToken };
};

export const forgetPasswordService = async (email) => {
  const user = await repo.findOne({ model: userModel, query: { email } });
  if (!user) throw new Error("user not found", { cause: { status: 404 } });
  const code = generateOTP();
  user.otp = { code, expiresIn: new Date(Date.now() + 10 * 60 * 1000) };
  await user.save({ validateBeforeSave: false });
  await sendEmail({ to: email, subject: "OTP", html: `<h1>${code}</h1>` });
  return { msg: "otp sent" };
};

export const resetPasswordService = async ({ email, otp, newPassword }) => {
  const user = await repo.findOne({ model: userModel, query: { email } });
  if (!user || user.otp?.code !== otp || user.otp?.expiresIn < Date.now())
    throw new Error("invalid otp", { cause: { status: 400 } });
  user.password = await hash({ plainText: newPassword });
  user.otp = undefined;
  await user.save({ validateBeforeSave: false });
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
        const randomPassword = crypto.randomBytes(32).toString('hex');
        const hashedPassword = await hash({ plainText: randomPassword });
        user = await repo.create({
            model: userModel,
            data: {
                firstName: given_name,
                lastName: family_name || ' ',
                email,
                provider: 1,
                password: hashedPassword,
                isVerified: true
            }
        });
    }

    const accessToken = jwt.sign(
        { _id: user._id, role: user.role }, 
        process.env.TOKEN_SIGNITURE,
        { expiresIn: '1h' }
    );

    return { accessToken };
};

export const logoutService = async ({ user, payload, flag = Logout.all }) => {
    if (flag === Logout.all) {
        user.credentialsChangedAt = Date.now();
        await user.save();
    } else if (flag === Logout.current) {
        const timeLeft = Math.floor(payload.exp - (Date.now() / 1000));
        
        await set({
            key: `blacklist:${payload.jti}`,
            value: 'true',
            ttl: timeLeft > 0 ? timeLeft : 3600
        });
    }
    
    return { data: {} };
};