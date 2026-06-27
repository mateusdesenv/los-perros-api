import dotenv from "dotenv";

dotenv.config();

export const env = {
  mongodbUri: process.env.MONGODB_URI,
  port: process.env.PORT || 3333
};
