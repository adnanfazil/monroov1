const util = require('util');
const multer = require('multer');
const maxSize = 35 * 1024 * 1024;
const mime = require('mime-types');
const fs = require("fs");

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const filePath = './public/uploads/'+file.fieldname+'/';
        fs.mkdirSync(filePath, { recursive: true })
        cb(null, filePath)
     },
     filename:(req,file,cb)=>{
      let ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
        cb(null, file.fieldname+Date.now()+ext);
     }
});

let uploadImageMuluter = multer({
  storage: storage,
  limits: { fileSize: maxSize }
}).fields(
    [
        {
            name:'images',
            maxCount:4 
        },
        {
            name: 'videos', maxCount: 2
        },
        {
            name: 'audios', maxCount: 2
        },
        {
            name: 'onevideo', maxCount: 1
        },
        {
            name: 'reel', maxCount: 1
        },
        {
            name: 'resumeCV', maxCount: 1
        },
        {
            name: 'portfolio', maxCount: 1
        }
    ]
);



const uploadImages = async (req, res , next) => {
    try {
      uploadImageMuluter(req, res , function(err){
        console.log("hi")
        if (err){
          console.log(err)
          req.files = null;
          next(err.message);
          // res.json({ error: '' + err });
          return;
        }
        if (!req.files) {
          console.log("No images uploaded")
          next("No files uploaded");
          // res.json({ error: 'Unknown error while uploading image' });
          // res.json({ fileUrl: process.env.DOMAIN_ME+'images/' });
          return;
        }
        console.log("success upload")
        next()
        // res.json({ fileUrl: process.env.DOMAIN_ME+'images/' + req.images[0].filename});
      });
    } catch (error) {
      console.log(error)

      req.files = null;
      next(error.message);
      // res.status(500).send({
      //   message: `Could not upload the file: ${req.file.originalname}. ${err}`,
      // });
    }
  };

let uploadImagesMiddleware = util.promisify(uploadImages);
module.exports = uploadImagesMiddleware;