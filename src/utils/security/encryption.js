import crypto from "crypto";
export const encryption = (text) => {
  const iv = crypto.randomBytes(Number(process.env.IV_LENGTH));
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(process.env.ENCRYPTION_SECRET_KEY),
    iv,
  );
  let cipherText = cipher.update(text, "utf-8", "hex");
  cipherText += cipher.final("hex");
  return `${iv.toString("hex")} : ${cipherText}`;
};
