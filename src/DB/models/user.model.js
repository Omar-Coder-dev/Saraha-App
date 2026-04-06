import { model, Schema } from "mongoose";
import { Gender, Roles, Providers } from "../enum.js"; //

const userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String },
    password: {
      type: String,
      required: function () {
        return this.provider === Providers.system;
      },
    },
    gender: {
      type: Number,
      enum: Object.values(Gender),
      default: Gender.male,
    },
    role: {
      type: Number,
      enum: Object.values(Roles),
      default: Roles.user,
    },
    credentialsChangedAt: { type: Date },
    provider: {
      type: Number,
      enum: Object.values(Providers),
      default: Providers.system,
    },
    isVerified: { type: Boolean, default: false },
    profileImage: { type: String },
    coverImages: { type: [String] },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
    strict: true,
    strictQuery: true,
    optimisticConcurrency: true,
  },
);

userSchema
  .virtual("username")
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  })
  .set(function (v) {
    const parts = v.split(" ");
    this.firstName = parts[0] || "";
    this.lastName = parts[1] || "";
  });

export const userModel = model("User", userSchema);
