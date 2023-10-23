var express = require('express');
var router = express.Router();
var Provider = require('../models/provider.model');
let uploadAll = require("../middleware/uploadAll");
let jwt = require('jsonwebtoken');
let auth = require("../middleware/auth");
let bcrypt = require('bcryptjs');
const crypto = require('crypto');
function uuidv4() {
    return crypto.randomUUID();
}

router.route('/login').post(function(req, res) {
    let username = req.body.username;
    let fcmToken = req.body.fcmToken;
    if (username){
        Provider.findOne({username: username} ,function (err, item) {
            if (item && item.password) {
                let password = req.body.password;
                if (!bcrypt.compareSync(password, item.password)){
                    modelError.error = "Wrong password";
                    return returnError(res , "Wrong password");
                }
                let email = item.email;
                let token = jwt.sign(
                    { user_id: item.id, user_name: username , email },
                        process.env.JWT_KEY,
                    {
                       expiresIn: "24h",
                    }
                   );
                item.token = token;
                item.fcmToken = fcmToken;
                item.status = 200;
                item.save(function (err) {
                    if (err) {
                      console.log("modelError:", err);
                      return returnError(res , "Cannot login " + err );
                     }else{
                        item.password = "*******"
                        return returnData(res , item);
                    }
                });
            }
            else {
                return returnError(res , "Cannot find user" );
            }
          });
    }else{
        return returnError(res , "Username not detected" );
    }
});

router.post('/Register', uploadAll ,async function( req, res, next) {
    try {
    const DOMAIN = process.env.DOMAIN_ME;
    let body = Provider(JSON.parse(req.body.data));
    const {images , videos , audios , onevideo , reel , resumeCV , portfolio} = req.files;
    if(images){
        let list = [];
        for(const item of images){
            list.push(DOMAIN+'uploads/images/'+item.filename);
        }
        body.photos = list;
    }
    if(videos){
        let list = [];
        for(const item of videos){
            list.push(DOMAIN+'uploads/videos/'+item.filename);
        }
        body.videos = list;
    }
    if(audios){
        let list = [];
        for(const item of audios){
            list.push(DOMAIN+'uploads/audios/'+item.filename);
        }
        body.videos = list;
    }
    if(onevideo){
        let list = [];
        for(const item of onevideo){
            list.push(DOMAIN+'uploads/onevideo/'+item.filename);
        }
        if(list)
            body.oneMinuteVideo = list[0]
    }
    if(reel){
        let list = [];
        for(const item of reel){
            list.push(DOMAIN+'uploads/reel/'+item.filename);
        }
        if(list)
            body.demoReel = list[0]
    }
    if(resumeCV){
        let list = [];
        for(const item of resumeCV){
            list.push(DOMAIN+'uploads/resumeCV/'+item.filename);
        }
        if(list)
            body.resume = list[0]
    }
    if(portfolio){
        let list = [];
        for(const item of portfolio){
            list.push(DOMAIN+'uploads/portfolio/'+item.filename);
        }
        if(list)
            body.portfolio = list[0]
    }
    body.id = uuidv4();
    console.log(body);
    if(body){
        const {username , id , email , phone} = body
        let oldUser = await Provider.findOne({$or:[{id: id}, {username: username},{email:email},{phone:phone}]});
        if (oldUser) {
			return returnError(res , "This user already registered, duplicate email , username , id or mobile number");
        }else{
            let encryptedPassword = await bcrypt.hash(body.password, 10);
            body.password = encryptedPassword;
            let token = jwt.sign(
                { user_id: id, user_name: username , email },
                    process.env.JWT_KEY,
                {
                   expiresIn:  "24h",
                }
               );

            body.token = token;
            body.save(function (err) {
                if (err) {
                    return returnError(res , "Cannot Register "+ err);
                 }else{
                    body.password = "*******"
                    return returnData(res , body);
		        }
               });
        }
    }else{
        return returnError(res , "Info not detected");
    }
            
 } catch (error) {
    return returnError(res , "Error "+error);
  }
});

function returnError(res , error){
    return res.status(203).send({status: 203 , data: error});
}

function returnData(res , data){
    return res.status(200).send({status: 200 , data: data});
}


module.exports = router;
