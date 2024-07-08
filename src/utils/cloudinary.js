import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uplodeOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // Uplode the file on cloudinary
    const responce = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    fs.unlinkSync(localFilePath);
    return responce;
  } catch (error) {
    console.error("Error uploading file to Cloudinary", error);
    if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    return null;
  }
};

export { uplodeOnCloudinary };
