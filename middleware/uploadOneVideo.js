const util = require('util');
const multer = require('multer');
const maxSize = 4 * 1024 * 1024;
const mime = require('mime-types');

let storage = multer.diskStorage({
  destination: (req, onevideo, cb) => {
    cb(null, './public/onevideo');
  },
  filename: (req, file, cb) => {
    try {
    console.log(file);
    cb(null, 'oneVideo-' + Date.now() + '.' +  mime.extension(file.mimetype));
  } catch (error) {
    console.log(error)
  }
  },
});

let uploadFile = multer({
  storage: storage,
  limits: { fileSize: maxSize },
}).single("onevideo");



const uploadOneVideo = async (req, res , next) => {
    try {
      console.log("hi111")
      uploadFile(req, res , function(err){
        console.log("hi")
        if (err){
          console.log(err)
          req.onevideo = null;
          next(err)
          // res.json({ error: '' + err });
        }
        if (req.onevideo == undefined) {
          req.onevideo = null;
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

      req.onevideo = null;
      next(error);
      // res.status(500).send({
      //   message: `Could not upload the file: ${req.file.originalname}. ${err}`,
      // });
    }
  };

let uploadFileMiddleware = util.promisify(uploadOneVideo);
module.exports = uploadFileMiddleware;