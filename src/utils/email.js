import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
  });
  const info = await transporter.sendMail({
    from: `"Saraha" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
  return info.accepted.length > 0;
}; 
