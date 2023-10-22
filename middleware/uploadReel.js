const util = require('util');
const multer = require('multer');
const maxSize = 4 * 1024 * 1024;
const mime = require('mime-types');

let storage = multer.diskStorage({
  destination: (req, reel, cb) => {
    cb(null, './public/reel');
  },
  filename: (req, file, cb) => {
    try {
    console.log(file);
    cb(null, 'reel-' + Date.now() + '.' +  mime.extension(file.mimetype));
  } catch (error) {
    console.log(error)
  }
  },
});

let uploadFile = multer({
  storage: storage,
  limits: { fileSize: maxSize },
}).single("reel");



const uploadreel = async (req, res , next) => {
    try {
      console.log("hi111")
      uploadFile(req, res , function(err){
        console.log("hi")
        if (err){
          console.log(err)
          req.reel = null;
          next(err)
          // res.json({ error: '' + err });
        }
        if (req.reel == undefined) {
          req.reel = null;
          console.log("No files uploaded")
          next("No files uploaded");
          // res.json({ error: 'Unknown error while uploading image' });
          // res.json({ fileUrl: process.env.DOMAIN_ME+'images/' });
        }
        console.log("success upload")
        next()
        // res.json({ fileUrl: process.env.DOMAIN_ME+'images/' + req.files[0].filename});
      });
    } catch (error) {
      console.log(error)

      req.reel = null;
      next(error);
      // res.status(500).send({
      //   message: `Could not upload the file: ${req.file.originalname}. ${err}`,
      // });
    }
  };

let uploadFileMiddleware = util.promisify(uploadreel);
module.exports = uploadFileMiddleware;