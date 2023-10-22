const util = require('util');
const multer = require('multer');
const maxSize = 2 * 1024 * 1024;
const mime = require('mime-types');

let storage = multer.diskStorage({
  destination: (req, images, cb) => {
    cb(null, './public/images');
  },
  filename: (req, file, cb) => {
    try {
    cb(null, 'image-' + Date.now() + '.' + mime.extension(file.mimetype));
  } catch (error) {
    console.log(error)
  }
  },
});

let uploadFile = multer({
  storage: storage,
  limits: { fileSize: maxSize },
}).array("images" , 4);



const upload = async (req, res , next) => {
    try {
      console.log("hi111")
      uploadFile(req, res , function(err){
        console.log("hi")
        if (err){
          console.log(err)
          req.images = null;
          next(err)
          // res.json({ error: '' + err });
        }
        if (req.images == undefined) {
          req.images = null;
          console.log("No images uploaded")
          next("No images uploaded");
          // res.json({ error: 'Unknown error while uploading image' });
          // res.json({ fileUrl: process.env.DOMAIN_ME+'images/' });
        }
        console.log("success upload")
        next()
        // res.json({ fileUrl: process.env.DOMAIN_ME+'images/' + req.images[0].filename});
      });
    } catch (error) {
      console.log(error)

      req.images = null;
      next(error);
      // res.status(500).send({
      //   message: `Could not upload the file: ${req.file.originalname}. ${err}`,
      // });
    }
  };

let uploadFileMiddleware = util.promisify(upload);
module.exports = uploadFileMiddleware;