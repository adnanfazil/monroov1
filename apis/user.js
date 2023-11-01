var express = require('express');
var router = express.Router();
var User = require('../models/users.model');
var Event = require('../models/event.model');
let upload = require("../middleware/multerUpload");
let uploadOne = require("../middleware/multerUploadSingle");
let jwt = require('jsonwebtoken');
let auth = require("../middleware/auth");
let bcrypt = require('bcryptjs');
const crypto = require('crypto');


router.route('/login').post(function (req, res) {
    const { username, fcmToken } = req.body;

    if (username) {
        User.findOne({$or :[{ username: username },{ email: username }]}, function (err, item) {
            if (item && item.password) {
                let password = req.body.password;
                if (!bcrypt.compareSync(password, item.password)) {
                    return returnError(res, "Wrong password");
                }
                let email = item.email;
                let token = jwt.sign(
                    { user_id: item.id, user_name: username, email },
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
                        return returnError(res, "Cannot login " + err);
                    } else {
                        item.password = "*******"
                        return returnData(res, item);
                    }
                });
            }
            else {
                return returnError(res, "Cannot find user");
            }
        });
    } else {
        return returnError(res, "Username not detected");
    }
});

router.post('/Register', async function (req, res, next) {
    try {
        const body = User(req.body);
        console.log({body});
        
        const userID = crypto.randomUUID(); 
        body.id = userID;
        if (!body) return returnError(res, "Info not detected");

        const { userName: username, email, phone } = body;
        let oldUser = await User.findOne({ $or: [{ id: body.id }, { username: username }, { email: email }, { phone: phone }] });
        if (oldUser)
            return returnError(res, "This user already registered, duplicate email or mobile number");

        let encryptedPassword = await bcrypt.hash(body.password, 10);
        body.password = encryptedPassword;
        let token = jwt.sign(
            { user_id: userID, user_name: username, email },
            process.env.JWT_KEY,
            {
                expiresIn: "24h",
            }
        );

        body.token = token;
        body.save(function (err) {
            if (err) {
                return returnError(res, "Cannot Register " + err);
            } else {
                body.password = "*******"
                return returnData(res, body);
            }
        });

    } catch (error) {
        return returnError(res, "Error " + error);
    }
});

router.post('/CreateEvent', auth, async function (req, res) {
    try{
        const event = Event(req.body);
        if(event){
            event.id = crypto.randomUUID();
            event.save(function(err){
                if(err){
                    return returnError(res, "Failed" + err);
                }else{
                    return returnData(res , event);
                }
            });
        }else{
            return returnError(res, "Data Not Correct");
        }
    }catch(err){
        return returnError(res, "Data Not Correct");
    }
});

function returnError(res, error) {
    return res.status(203).send({ status: 203, data: error });
}

function returnData(res, data) {
    return res.status(200).send({ status: 200, data: data });
}



module.exports = router;
