var express = require('express');
var router = express.Router();
var User = require('../models/users.model');
var Provider = require('../models/provider.model');
var Event = require('../models/event.model');
var Message = require('../models/message.model');
var Reviews = require('../models/reviews.model');
let jwt = require('jsonwebtoken');
let auth = require("../middleware/auth");
let myAuth = require("../middleware/myAuth");
let bcrypt = require('bcryptjs');
const crypto = require('crypto');
var Permission = require('../models/permission.model');
let uploadAll = require("../middleware/uploadAll");

const admin = require('../bin/fbinit');

router.route('/getAllEvents').post(myAuth,async function(req, res) {
    Event.find(function(err , item){
        if(item){
            returnData(res , item);
        }else if(err){
            returnError(res , err);
        }
    });
});
router.route('/getAllUsers').post(myAuth,async function(req, res) {
    User.find(function(err , item){
        if(item){
            returnData(res , item);
        }else if(err){
            returnError(res , err);
        }
    });
});
router.route('/fcmToken').post(auth,async function(req, res) {
    let userID = req.user.userID
    let fcmToken = req.body.fcmToken
    if(fcmToken){
        let user = await User.findOne({id: userID});
        user.fcmToken = fcmToken;
        await user.save();
        console.log(user);

        returnData(res , user);
    }else{
        console.log( "Fcm Token not found");

        returnError(res , "Fcm Token not found");
    }
});
router.route('/removeUser').post(myAuth,async function(req, res) {
    User.deleteMany({id: req.body.userID}, function(err , item){
        if(err){
            res.status(202).send({error: err});
        }else{
            res.status(200).send({message: item});
        }
    });
});

router.route('/checkAuth').post(async function(req, res) {
    const config = process.env;
    var tokenMe = req.headers["x-access-token"];
    if (!tokenMe) {
        return returnError(res , "Token not sent");
    }else{
        try {
            const decoded = jwt.verify(tokenMe, config.JWT_KEY);
            req.user = decoded;
            let userID = req.user.userID
            var user = await User.findOne({id: userID});
            if(!user){
                return returnError(res , "User Not Found");
            }
            return returnData(res , user);
        } catch (err) {
            try{
                if(err.name === 'TokenExpiredError') {
                    const payload = jwt.verify(tokenMe, config.JWT_KEY, {ignoreExpiration: true} );
                    var userID = payload.userID;
                    var user = await User.findOne({id: userID});
                    var email = user.email;
                    var country = user.country;
                    let token = jwt.sign(
                        { userID: userID, email: email, country: country },
                            process.env.JWT_KEY,
                        {
                           expiresIn: "24h",
                        }
                       );
                       user.token = token;
                       await user.save();
                       return returnData(res , user);
    
                }else{
                    console.log("err not expired but other exception :" + err);
                    return returnError(res , "Token is not valid ." + err);
                }
            }catch(err){
                console.log(err);
                return returnError(res , "Token is not valid "+ err.message);

            }

          }
    }

});
router.route('/loginSocial').post(myAuth ,function(req, res) {
    const { username, fcmToken } = req.body;
    if (username){
        User.findOne({$or :[{ username: username },{ email: username }]} ,function (err, item) {
            if (item && item.password) {
                let password = process.env.SOCIALPASS;
                if (!bcrypt.compareSync(password, item.password)){
                    return returnError(res , "Wrong password");
                }
                let token = getToken(item.id , item.email , item.country);
                item.token = token;
                if(fcmToken)
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
router.post('/SocialRegister',[uploadAll , myAuth], async function (req, res, next) {
    try {
        const DOMAIN = process.env.DOMAIN_ME;
        const body = User(JSON.parse(req.body.data));
        const {profilePic} = req.files;
        if(profilePic){
            for(const item of profilePic){
                body.profilePic = DOMAIN+'uploads/profilePic/'+item.filename;
            }
        }

        const userID = crypto.randomUUID(); 
        body.id = userID;
        if (!body) return returnError(res, "Info not detected");
 
        const { userName: username, email, phone } = body;
        let oldUser = await User.findOne({ $or: [{ id: body.id }, { email: email }, { phone: phone }] });
        if (oldUser)
            return returnError(res, "This user already registered, duplicate email or mobile number");
            
        body.password = process.env.SOCIALPASS;
        let encryptedPassword = await bcrypt.hash(body.password, 10);
        body.password = encryptedPassword;
        let token = getToken(userID , body.email , body.country);
        body.token = token;
        console.log({body});
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
router.post('/Register',[uploadAll,myAuth], async function (req, res, next) {
    try {
        const DOMAIN = process.env.DOMAIN_ME;
        const body = User(JSON.parse(req.body.data));
        console.log({body});
        const {profilePic} = req.files;
        if(profilePic){
            for(const item of profilePic){
                body.profilePic = DOMAIN+'uploads/profilePic/'+item.filename;
            }
        }else{
            body.profilePic = "";
        }
        const userID = crypto.randomUUID(); 
        body.id = userID;
        if (!body) return returnError(res, "Info not detected");

        const { userName: username, email, phone } = body;
        let oldUser = await User.findOne({ $or: [{ id: body.id }, { email: email }, { phone: phone }] });
        console.log(oldUser);
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
router.post('/UpdateUser',[uploadAll,myAuth], async function (req, res, next) {
    try {
        const DOMAIN = process.env.DOMAIN_ME;
        const body = User(JSON.parse(req.body.data));
        const {profilePic} = req.files;
        if(profilePic){
            for(const item of profilePic){
                body.profilePic = DOMAIN+'uploads/profilePic/'+item.filename;
            }
        }
        if (!body) return returnError(res, "Info not detected");
        const {id, email, phone } = body;
        let oldUser = await User.findOne({ $or: [{ id: body.id }, { email: email }, { phone: phone }] });
        console.log(oldUser);
        if (oldUser){
            // let password = body.password;
            // if (!bcrypt.compareSync(password, oldUser.password)){
            //     return returnError(res , "Wrong password");
            // }
            body.password = oldUser.password;
            let token = getToken(id , body.email , body.country);
            body.token = token;
            body._id = oldUser._id;
            body._v = oldUser._v;
            const doc = await User.findOneAndUpdate({$or:[{id: id },{email:email}]}, body, {
                new: true
              });
            if(doc){
                doc.password = "******";
                return returnData(res , doc);
            }else{
                return returnError(res , "Error occured");
            }
            // body.save(function (err) {
            //     if (err) {
            //         return returnError(res, "Cannot Register " + err);
            //     } else {
            //         body.password = "*******"
            //         return returnData(res, body);
            //     }
            // });
        }else
            return returnError(res, "Cannot find user info");


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

router.post('/cancelEvent',auth, function (req, res) {
    try{
        const eventID = req.body.eventID;
        Event.findOne({id: eventID},function(err , item){
            if(err){
                return returnError(res, "Failed"+err);
            }else {
                if(item){
                    item.status = 4;// cancel
                    item.save();
                    sendNotification(item.providerID , "Event Canceled" , "Event has been canceled" , "Cancel" )
                    return returnData(res, item);
                }else{
                    return returnError(res, "Failed, event not found");
                }
            }
        });
    }catch(err){
        return returnError(res, "Failed"+err);
    }
});

router.post('/GetReviews',auth, function (req, res) {
    try{
        const userID = req.user.userID;
        const providerID = req.body.providerID;
        Reviews.find({providerID: providerID},function(err , items){
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

router.post('/AddReview',auth, async function (req, res) {
    try{
        const review  = new Reviews(req.body);
        const userID = req.user.userID;
        review.userID = userID;
        review.isProvider = false;
        var oldReview = await Reviews.findOne({userID: userID, providerID: review.providerID , isProvider: false });
        if(oldReview){
            return returnError(res, "Aready Rated!");
        }
        review.id = crypto.randomUUID();
        review.save(function(err){
            if(err){
                return returnError(res, "Failed" + err);
            }else{
                return returnData(res , true);
            }
        });
    }catch(err){
        return returnError(res, "Failed"+err);
    }
});

router.post('/ListProviders', auth, async function (req, res) {
    try{
        // const isAll = req.body.isAll;
        const isAll = true;
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
router.post('/ListOutProviders', myAuth, async function (req, res) {
    try{
        // const isAll = req.body.isAll;
        Provider.find( function(err, items) {
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

router.post('/SearchProviders', auth, async function (req, res) {
    try{
        const key = req.body.key;
        const ids = req.body.ids;
        console.log("key" , key);
        console.log("ids", ids);
        Provider.find( 
    {$and:
        [ 
            {$or: 
                [
                    {bio: { "$regex": key, "$options": "i" }}, 
                    {fname: { "$regex": key, "$options": "i" }},
                    {experience: { "$regex": key, "$options": "i" }}
                ]
            },
            {catID: {$in: JSON.parse(ids)} }
        ]}, function(err, items) {
            if(err){
                return returnError(res , err);
            }else{
                return returnData(res , items);
            }
        } );
        
    }catch(err){
        return returnError(res, err);
    }
});
router.post('/GetProviderProfile',auth , async function (req, res) {
    try{
        var providerID = req.body.providerID;
        Provider.findOne({id: providerID}, async function(err , item){
            if(err){
                return returnError(res, "Failed "+err);
            }else {
                if(item){
                    return returnData(res, item);
                }
            }
        });
    }catch(err){
        return returnError(res, "Failed "+err);
    }
});

router.post('/RequestEvent', auth, async function (req, res) {
    try{
        const eventID = req.body.eventID;
        const providerID = req.body.providerID;
        let event = await Event.findOne({id: eventID});
        if(event && event.status == 4){
            return returnError(res, "This event has been canceled, please create new one");
        }
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
                    sendNotification(providerID , "Event Requested" , "You have new event request" , "RequestEvent" )
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

router.post('/MakeADeal', auth, async function (req, res) {
    try{
        const eventID = req.body.eventID;
        const msgID = req.body.msgID;
        const providerID = req.body.providerID;
        const dealPrice = req.body.dealPrice;
        if(providerID && eventID){
            var message = Message();
            message.id = crypto.randomUUID();
            message.msg = dealPrice;
            message.type = 5;
            message.providerID = providerID;
            message.eventID = eventID;
            message.userID = req.user.userID;
            message.senderID = req.user.userID;
            message.save(async function(err){
                if(err){
                    return returnError(res, "Failed" + err);
                }else{
                    try{
                        let oldmsg = await Message.findOne({id: msgID});
                        oldmsg.msgStatus = 4;
                        oldmsg.save();
                    }catch(ex){
                        console.log(ex);
                    }

                    sendNotification(providerID , "Deal Requested" , "You have new event deal request" , "RequestDeal" )

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

router.post('/ApproveDeal', auth, function (req, res) {
    try{
        const userID = req.body.userID;
        const providerID = req.body.providerID;
        const eventID = req.body.eventID;
        const msgID = req.body.msgID;
        if(userID && providerID && eventID , msgID){
             Event.findOne({id : eventID } , async function(err , event){
                var messageOld = await Message.findOne({id : msgID });
                if(event && messageOld){
                    // console.log("oldmsg" , messageOld.msg);
                    event.dealCost = messageOld.msg;
                    event.providerID = providerID;
                    event.status = 1; // booked
                    await event.save();
                    var message = Message();
                    message.id = crypto.randomUUID();
                    message.msg = messageOld.msg;
                    message.type = 6;
                    message.providerID = providerID;
                    message.eventID = eventID;
                    message.userID = userID;
                    message.senderID = providerID;
                    message.save(async function(err){
                        if(err){
                            return returnError(res, "Failed" + err);
                        }else{
                            let permission = await Permission.findOne({userID: userID , providerID: providerID ,eventID : eventID});
                            if(permission){
                                permission.isWaitingPayment = true;
                                permission.isAllowed = true;
                                permission.eventDoneSucces = false;
                                await permission.save();
                                try{
                                    messageOld.msgStatus = 4;
                                    messageOld.save();
                                }catch(ex){
                                    console.log(ex);
                                }
                                sendNotification(userID , "Deal Requested" , "You have new event deal request" , "RequestDeal" , true )

                                return returnData(res , true);
                                
                            }else{
                                // create new permission and save
                                return returnError(res, "Failed, Permission error occured");
                            }
                        }
                    });
                }else{
                    return returnError(res, "Failed, Event not found");
                }
             });
  
 
        }else{
            return returnError(res, "wrong sent data");
        }

    }catch(err){
        return returnError(res, err.message);
    }
});
router.post('/getMessagesProfiles', auth, function (req, res) {
    try{
        const userID = req.user.userID;
        Message.find({userID: userID}, async function(err , items){
            if(err){
                returnError(res , err);
            }else{

                const ids = items.map(({ providerID }) => providerID);
                const filtered = items.filter(({ providerID }, index) =>
                !ids.includes(providerID, index + 1));
                var response = [];
                for(const item of filtered){
                    const sender = await Provider.findOne({id: item.providerID});
                    if(!sender)
                      continue;
                    var data = {};
                    data.messageID = item.id;
                    data.senderID = item.providerID;
                    data.senderName = sender.fname;
                    data.senderPhoto = sender.profilePic;
                    data.msgDate = sender.msgDate;
                    response.push(data);
                }
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
                    if(item.type === 1 || item.type === 4 || item.type === 5 || item.type === 6){
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
router.post('/getPermission', auth,async function (req, res) {
    try{
        const userID = req.body.userID;
        const providerID = req.body.providerID;
        const eventID = req.body.eventID;
        Permission.findOne({providerID: providerID , userID: userID, eventID: eventID}, function(err , item){
            if(err){
               return returnError(res , err);
            }else{
                if(item)
                    return returnData(res , item);
                else
                    return returnError(res , "Send not allowed");

            }
        });
    }catch(err){
        return returnError(res, err);
    }
});


router.post('/ApprovePermission', auth,async function (req, res) {
    try{
        const userID = req.body.userID;
        const providerID = req.body.providerID;
        const eventID = req.body.eventID;
        const msgID = req.body.msgID;
        const permissionValue = req.body.permissionValue;
        const paymentwaiting = req.body.paymentwaiting;
        if(userID && providerID && eventID){
            let permission = await Permission.findOne({userID: userID, providerID: providerID, eventID: eventID});
            if(!permission || !permission.id){
                permission = new Permission();
                permission.id = crypto.randomUUID();
            }
            permission.eventID = eventID;
            permission.providerID = providerID;
            permission.userID = userID;
            if(permissionValue === undefined || permissionValue === null)
                permission.isAllowed = true;
            else
                permission.isAllowed = permissionValue;
            if(paymentwaiting === undefined || paymentwaiting === null)
                permission.isWaitingPayment = false;
            else
                permission.isWaitingPayment = paymentwaiting;
            permission.save(async function(err){
                if(err){
                   return returnError(res , err);
                }else{
                    try{
                        let message = await Message.findOne({id: msgID});
                        message.msgStatus = 2;
                        message.save();
                    }catch(ex){
                        console.log(ex);
                    }
                    sendNotification(providerID , "Message Allowed" , "a conversation has been opend to talk" , "PermissionAproved");
                    return returnData(res , permission);
                }
            });
        }else{
            return returnError(res, "wrong sent data");
        }

    }catch(err){
        return returnError(res, err);
    }
});
router.post('/sendMessage', auth, async function (req, res) {
    try{
        const message = Message(req.body); 
        if(message){
            message.id = crypto.randomUUID();
            message.userID = req.user.userID;
            message.senderID = req.user.userID;
            message.msgDate = Date.now();
            message.save(function(err){
                if(err){
                    return returnError(res, "Failed" + err);
                }else{
                    sendNotification(message.providerID , "New Message" , "You have new message" , "Message"  )

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
        Event.find({userID: userID, status: {$ne: 4} }, async function(err , items){
            if(err){
                returnError(res , err);
            }else{
                console.log(items);
                returnData(res , items);
            }
        });
    }catch(err){
        return returnError(res, "Data Not Correct");
    }
});

router.post('/getAllUserBookings', auth,async function (req, res) {
    try{
        const currentTimestampInMilliseconds = new Date().getTime();
        const userID = req.user.userID;
        console.log(userID);
        Event.find({userID: userID}, async function(err , items){
            if(err){
                returnError(res , err);
            }else{
                console.log(items);
                returnData(res , items);
            }
        });
    }catch(err){
        return returnError(res, "Data Not Correct");
    }
});


async function sendNotification( userID , title , body , type , isUser =false ) {
    try{
        console.log("user id" , userID);

    var tokens = [];
    if(isUser){
        let user = await User.findOne({id: userID});
        console.log("user user" , user);

        if(user){
            tokens.push(user.fcmToken);
        }
    }else{
        let provider = await Provider.findOne({id: userID});
        console.log("user provider" , provider);

        if(provider){
            tokens.push(provider.fcmToken);
        }
    }

        const notification_options = {
            priority: "high",
            timeToLive: 60 * 60 * 24
        };
        const message = {
                data: {
                title: title,
                body: body,
                type: type,
                sound : "default"
                },
                notification: {
                    title: title,
                    body: body,
                    type: type,
                    sound : "default"
                }
            };
    if(tokens.length > 0){
        admin.messaging().sendToDevice(tokens, message, notification_options)
        .then( response => {
            console.log('Success sent message')
        })
        .catch( error => {
            console.log(error);
        });
    }else{
        console.log("no fcms");
    }
}catch(ex){
    console.log(ex);
}
}
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
