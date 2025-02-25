import Cloudinary from "../utils/cloudinary";
import Sharp from "sharp";
import fs from "fs";
import path from "path";

exports.upload = async (file) => {
  try {
    if (!file) {
      throw new Error("Input file is missing");
    }

    const { path: filePath, filename } = file;

    // Use the full file path that multer provides
    const originalImage = filePath;
    const resizedImage = path.join(path.dirname(filePath), `temp_${filename}`);

    await Sharp(originalImage)
      .resize({ width: 720 })
      .jpeg({ quality: 90 })
      .toFile(resizedImage);

    const cloudImage = await Cloudinary.uploader.upload(resizedImage);

    // Clean up temporary files
    fs.unlinkSync(originalImage);
    fs.unlinkSync(resizedImage);

    return cloudImage;
  } catch (error) {
    console.error("Image upload error:", error.message);
    throw error;
  }
};

exports.destroy = async (public_id) => {
  return await Cloudinary.uploader.destroy(public_id);
};
