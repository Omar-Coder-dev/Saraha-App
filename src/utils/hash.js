import bcrypt from "bcrypt";
export const hash = async ({ plainText, saltRound = 8 }) =>
  await bcrypt.hash(plainText, saltRound);
export const compare = async ({ cypherText, text }) =>
  await bcrypt.compare(text, cypherText);
export const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();
