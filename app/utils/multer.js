import multer from "multer";
import path from "path";

module.exports = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    // Create regex to match jpg and png
    const validFileTypes = /jpg|jpeg|png/

    // Do the regex match to check if file extenxion match
    const extname = validFileTypes.test(path.extname(file.originalname).toLowerCase())
    if (extname) {
      // Return true and file is saved
      return cb(null, true)
    } else {
      // Return error message if file extension does not match
      return cb("Error: Images Only!")
    }
  }
})