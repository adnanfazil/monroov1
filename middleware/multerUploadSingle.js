const util = require('util');
const multer = require('multer');
const maxSize = 4 * 1024 * 1024;

let storage = multer.diskStorage({
  destination: (req, files, cb) => {
    cb(null, './public/images');
  },
  filename: (req, file, cb) => {
    try {
    console.log(file);
    var filetype = '';
    if(file.mimetype === 'image/png') {
      filetype = 'png';
    }else
    if(file.mimetype === 'image/jpeg') {
      filetype = 'jpg';
    }else{
      filetype = 'jpg';
    }
    cb(null, 'image-' + Date.now() + '.' + filetype);
  } catch (error) {
    console.log(error)
  }
  },
});

let uploadFile = multer({
  storage: storage,
  limits: { fileSize: maxSize },
}).single("files");



const uploadOne = async (req, res , next) => {
    try {
      console.log("hi111")
      uploadFile(req, res , function(err){
        console.log("hi")
        if (err){
          console.log(err)
          req.files = null;
          next(err)
          // res.json({ error: '' + err });
        }
        if (req.file == undefined) {
          req.file = null;
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

      req.files = null;
      next(error);
      // res.status(500).send({
      //   message: `Could not upload the file: ${req.file.originalname}. ${err}`,
      // });
    }
  };

let uploadFileMiddleware = util.promisify(uploadOne);
module.exports = uploadFileMiddleware;