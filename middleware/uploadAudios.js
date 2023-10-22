const util = require('util');
const multer = require('multer');
const maxSize = 25 * 1024 * 1024;
const mime = require('mime-types');

let storage = multer.diskStorage({
  destination: (req, audios, cb) => {
    cb(null, './public/audios');
  },
  filename: (req, file, cb) => {
    try {
    console.log(file);

    cb(null, 'audio-' + Date.now() + '.' + mime.extension(file.mimetype));
  } catch (error) {
    console.log(error)
  }
  },
});

let uploadFile = multer({
  storage: storage,
  limits: { fileSize: maxSize },
}).array("audios" , 4);



const upload = async (req, res , next) => {
    try {
      console.log("hi111")
      uploadFile(req, res , function(err){
        console.log("hi")
        if (err){
          console.log(err)
          req.audios = null;
          next(err)
          // res.json({ error: '' + err });
        }
        if (req.audios == undefined) {
          req.audios = null;
          console.log("No audios uploaded")
          next("No audios uploaded");
          // res.json({ error: 'Unknown error while uploading image' });
          // res.json({ fileUrl: process.env.DOMAIN_ME+'images/' });
        }
        console.log("success upload")
        next()
        // res.json({ fileUrl: process.env.DOMAIN_ME+'images/' + req.files[0].filename});
      });
    } catch (error) {
      console.log(error)

      req.audios = null;
      next(error);
      // res.status(500).send({
      //   message: `Could not upload the file: ${req.file.originalname}. ${err}`,
      // });
    }
  };

let uploadFileMiddleware = util.promisify(upload);
module.exports = uploadFileMiddleware;