import express from "express";
import authRouter from "./modules/auth/auth.controller.js";
import userRouter from "./modules/userModule/user.controller.js";
import { DBConnection } from "./DB/db.connection.js";
import cors from "cors";
const main = async () => {
  const app = express();
  app.use(express.json());
  app.use(cors());
  app.listen(process.env.PORT, () =>
    console.log(`Server is running on port ${process.env.PORT}`),
  );
  await DBConnection();
  app.use("/uploads", express.static("./uploads"));
  app.use(cors());
  app.use("/auth", authRouter);
  app.use("/users", userRouter);

  app.use((err, req, res, next) => {
    res.status(err.cause?.status || 500).json({
      errMsg: err.message,
    });
  });
};

export default main;
