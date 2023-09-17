var express = require('express');
var router = express.Router();
var User = require('../models/users.model');
let upload = require("../middleware/multerUpload");
let uploadOne = require("../middleware/multerUploadSingle");
let jwt = require('jsonwebtoken');
let bcrypt = require('bcryptjs');
const crypto = require('crypto');

router.route('/login').post(function(req, res) {
    let username = req.body.username;
    let fcmToken = req.body.fcmToken;
    if (username){
        User.findOne({username: username} ,function (err, item) {
            if (item && item.password) {
                let password = req.body.password;
                if (!bcrypt.compareSync(password, item.password)){
                    let modelError = new User();
                    modelError.error = "Wrong password";
                    modelError.status = 204;
                    res.status(202).send(modelError);
                    return;
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
                if(item.subscriptionType === 1){
                    if(item.deviceIDsBransh[item.deviceID] === null){
                        if(item.deviceIDsBransh.size === 1){
                            let modelError = new User();
                            modelError.error = "Cannot login, you exceeded the limit of loggedin branchs";
                            item.status = 206;
                            res.status(202).send(modelError);
                            console.log("modelError:", modelError);
                            return;
                        }
                    }
                }
                if(item.subscriptionType === 2){
                    if(item.deviceIDsBransh[item.deviceID] === null){
                        if(item.deviceIDsBransh.size === 4){
                            let modelError = new User();
                            modelError.error = "Cannot login, you exceeded the limit of loggedin branchs";
                            item.status = 206;
                            res.status(202).send(modelError);
                            console.log("modelError:", modelError);
                            return;
                        }
                    }
                }
                if(item.subscriptionType === 3){
                    if(item.deviceIDsBransh[item.deviceID] === null){
                        if(item.deviceIDsBransh.size === 8){
                            let modelError = new User();
                            modelError.error = "Cannot login, you exceeded the limit of loggedin branchs";
                            item.status = 206;
                            res.status(202).send(modelError);
                            console.log("modelError:", modelError);
                            return;
                        }
                    }
                }
                if(item.subscriptionType === 4){
                    if(item.deviceIDsBransh[item.deviceID] === null){
                        if(item.deviceIDsBransh.size === 20){
                            let modelError = new User();
                            modelError.error = "Cannot login, you exceeded the limit of loggedin branchs";
                            item.status = 206;
                            res.status(202).send(modelError);
                            console.log("modelError:", modelError);
                            return;
                        }
                    }
                }
                item.save(function (err) {
                    if (err) {
                      let modelError = new User();
                      modelError.error = "Cannot login " + err;
                      item.status = 205;
                      res.status(202).send(modelError);
                      console.log("modelError:", modelError);
                     }else{
                        item.password = "*******"
                        res.status(200).send(item);
                    }
                });
                
            }
            else {
                let modelError = new User();
                modelError.error = "Cannot find user " ;
                modelError.status = 203;
                res.status(202).send(modelError);
            }
          });
    }else{
        let modelError = new User();
        modelError.error = "Username not detected" ;
        modelError.status = 202;
        console.log("modelError:", modelError);
        res.status(202).send(modelError);
    }
});










module.exports = router;
