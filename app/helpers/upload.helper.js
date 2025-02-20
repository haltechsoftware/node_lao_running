import Cloudinary from "../utils/cloudinary";
import Sharp from "sharp";
import fs from "fs";

exports.upload = async (file) => {
  const { filename: image, destination } = file;

  const originalImage = destination + image;
  const resizedImage = destination + "temp_" + image;

  await Sharp(originalImage)
    .resize({ width: 720 })
    .jpeg({ quality: 90 })
    .toFile(resizedImage);

  const cloudImage = await Cloudinary.uploader.upload(resizedImage);

  fs.unlinkSync(originalImage);
  fs.unlinkSync(resizedImage);

  return cloudImage;
};

exports.destroy = async (public_id) => {
  return await Cloudinary.uploader.destroy(public_id);
};
