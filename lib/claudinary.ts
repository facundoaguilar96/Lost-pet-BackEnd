import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLA_NAME,
  api_key: process.env.CLA_KEY,
  api_secret: process.env.CLA_SECT,
});

export { cloudinary };
