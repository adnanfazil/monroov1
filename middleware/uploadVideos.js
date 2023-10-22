const util = require('util');
const multer = require('multer');
const maxSize = 2 * 1024 * 1024;
const mime = require('mime-types');

let storage = multer.diskStorage({
  destination: (req, videos, cb) => {
    cb(null, './public/videos');
  },
  filename: (req, file, cb) => {
    try {
    cb(null, 'videos-' + Date.now() + '.' + mime.extension(file.mimetype));
  } catch (error) {
    console.log(error)
  }
  },
});

let uploadFile = multer({
  storage: storage,
  limits: { fileSize: maxSize },
}).array("videos" , 4);



const upload = async (req, res , next) => {
    try {
      console.log("hi111")
      uploadFile(req, res , function(err){
        console.log("hi")
        if (err){
          console.log(err)
          req.videos = null;
          next(err)
          // res.json({ error: '' + err });
        }
        if (req.videos == undefined) {
          req.videos = null;
          console.log("No videos uploaded")
          next("No videos uploaded");
          // res.json({ error: 'Unknown error while uploading image' });
          // res.json({ fileUrl: process.env.DOMAIN_ME+'videos/' });
        }
        console.log("success upload")
        next()
        // res.json({ fileUrl: process.env.DOMAIN_ME+'videos/' + req.videos[0].filename});
      });
    } catch (error) {
      console.log(error)

      req.videos = null;
      next(error);
      // res.status(500).send({
      //   message: `Could not upload the file: ${req.file.originalname}. ${err}`,
      // });
    }
  };

let uploadFileMiddleware = util.promisify(upload);
module.exports = uploadFileMiddleware;