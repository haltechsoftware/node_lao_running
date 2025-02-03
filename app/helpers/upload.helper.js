import Cloudinary from '../utils/cloudinary'
import Sharp from 'sharp'
import fs from 'fs'

exports.upload = async (file) => {
  try {
    let cloudImage
    const {
      filename: image,
      destination: destination,
    } = file;

    const originalImage = destination + image;
    const resizedImage = destination + 'temp_' + image

    await Sharp(originalImage)
      .resize({
        width: 720
      })
      .jpeg({
        quality: 90
      })
      .toFile(
        resizedImage
      )


    cloudImage = await Cloudinary.uploader.upload(resizedImage)

    fs.unlinkSync(originalImage)
    fs.unlinkSync(resizedImage)

    return cloudImage
  } catch (error) {
    throw error
  }

}

exports.destroy = async (public_id) => {
  try {
    return await Cloudinary.uploader.destroy(public_id)
  } catch (error) {
    throw error
  }
}