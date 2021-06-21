  
const multer = require("multer");
const path = require("path");

// Multer config
module.exports = multer({
  storage: multer.diskStorage({}),
  // limits:{
  //   fileSize:1000
  //   },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);  
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
      cb(new Error("File type is not supported"), false);
    }
    cb(null, true);
  }
  

});