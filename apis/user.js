var express = require('express');
var router = express.Router();
var User = require('../models/users.model');
var Provider = require('../models/provider.model');
var Event = require('../models/event.model');
var Message = require('../models/message.model');
let upload = require("../middleware/multerUpload");
let uploadOne = require("../middleware/multerUploadSingle");
let jwt = require('jsonwebtoken');
let auth = require("../middleware/auth");
let myAuth = require("../middleware/myAuth");
let bcrypt = require('bcryptjs');
const crypto = require('crypto');


router.route('/login').post(myAuth,function (req, res) {
    const { username, fcmToken } = req.body;

    if (username) {
        User.findOne({$or :[{ username: username },{ email: username }]}, function (err, item) {
            if (item && item.password) {
                let password = req.body.password;
                if (!bcrypt.compareSync(password, item.password)) {
                    return returnError(res, "Wrong password");
                }
                let token = getToken(item.id , item.email , item.country);
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

router.post('/Register',myAuth, async function (req, res, next) {
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
        let token = getToken(userID , body.email , body.country);
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
        event.userID = req.user.userID;
        event.country = req.user.country;
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



router.post('/GetUserEvents',auth, function (req, res) {
    try{
        const userID = req.user.userID;
        Event.find({userID: userID},function(err , items){
            if(err){
                return returnError(res, "Failed"+err);
            }else {
                return returnData(res, items);
            }
        });
    }catch(err){
        return returnError(res, "Failed"+err);
    }
});


router.post('/ListProviders', auth, async function (req, res) {
    try{
        const isAll = req.body.isAll;
        const userID = req.user.userID;
        const user = await User.findOne({id: userID});
        if(!user){
           return returnError(res , "User info not detected");
        }
        if(isAll){
            Provider.find({}, function(err, items) {
                if(err){
                    return returnError(res , err);
                }else{
                    return returnData(res , items);
                }
            } );
            return;
        }
        Provider.find({catID: {$in: user.intrestedList} }, function(err, items) {
            if(err){
                return returnError(res , err);
            }else{
                return returnData(res , items);
            }
        } );
        
    }catch(err){
        return returnError(res, "Data Not Correct");
    }
});



router.post('/RequestEvent', auth, async function (req, res) {
    try{
        const eventID = req.body.eventID;
        const providerID = req.body.providerID;
        if(providerID && eventID){
            var message = Message();
            message.id = crypto.randomUUID();
            message.msg = "";
            message.type = 1;
            message.providerID = providerID;
            message.eventID = eventID;
            message.userID = req.user.userID;
            message.senderID = req.user.userID;
            message.save(function(err){
                if(err){
                    return returnError(res, "Failed" + err);
                }else{
                    return returnData(res , true);
                }
            });
        }else{
            return returnError(res, "Data Not Correct");
        }
    }catch(err){
        return returnError(res, "Data Not Correct");
    }
});

router.post('/getMessagesProfiles', auth, function (req, res) {
    try{
        const userID = req.user.userID;
        Message.find({userId: userID}, async function(err , items){
            if(err){
                returnError(res , err);
            }else{

                const ids = items.map(({ providerID }) => providerID);
                const filtered = items.filter(({ providerID }, index) =>
                !ids.includes(providerID, index + 1));
                var response = [];
                for(const item of filtered){
                    const sender = await Provider.findOne({id: item.providerID});
                    var data = {};
                    data.messageID = item.id;
                    data.senderID = item.providerID;
                    data.senderName = sender.fname;
                    data.senderPhoto = sender.profilePic;
                    response.push(data);
                }5
                returnData(res , response);
            }
        });
    }catch(err){
        return returnError(res, "Data Not Correct");
    }
});
router.post('/getDetailedMessages', auth,async function (req, res) {
    try{
        const userID = req.user.userID;
        const providerID = req.body.providerID;
        Message.find({providerID: providerID , userID: userID}, async function(err , items){
            if(err){
                returnError(res , err);
            }else{
                for (var item of items){
                    if(item.type === 1){
                        const event = await Event.findOne({id: item.eventID});
                        item.eventObj = event;
                    }
                }
                returnData(res , items);
            }
        });
    }catch(err){
        return returnError(res, "Data Not Correct");
    }
});


router.post('/sendMessage', auth, async function (req, res) {
    try{
        const message = Message(req.body); 
        if(message){
            message.id = crypto.randomUUID();
            message.userID = req.user.userID;
            message.senderID = req.user.userID;
            message.save(function(err){
                if(err){
                    return returnError(res, "Failed" + err);
                }else{
                    return returnData(res , message);
                }
            });
        }else{
            return returnError(res, "Data Not Correct");
        }
    }catch(err){
        return returnError(res, "Data Not Correct");
    }
});


router.post('/getBookings', auth,async function (req, res) {
    try{
        const currentTimestampInMilliseconds = new Date().getTime();
        const userID = req.user.userID;
        Event.find({userID: userID}, async function(err , items){
            if(err){
                returnError(res , err);
            }else{
                returnData(res , items);
            }
        });
    }catch(err){
        return returnError(res, "Data Not Correct");
    }
});

function getToken(id , email , country){
    return jwt.sign(
        { userID: id, email: email, country: country },
        process.env.JWT_KEY,
        {
            expiresIn: "24h",
        }
    );
}
function returnError(res, error) {
    return res.status(203).send({ status: 203, data: error });
}

function returnData(res, data) {
    return res.status(200).send({ status: 200, data: data });
}



module.exports = router;
