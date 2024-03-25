var express = require('express');
var router = express.Router();
var Provider = require('../models/provider.model');
var User = require('../models/users.model');
let uploadAll = require("../middleware/uploadAll");
var Event = require('../models/event.model');
let jwt = require('jsonwebtoken');
let auth = require("../middleware/auth");
let myAuth = require("../middleware/myAuth");
var Message = require('../models/message.model');
let bcrypt = require('bcryptjs');
const crypto = require('crypto');
var Reviews = require('../models/reviews.model');

function uuidv4() {
    return crypto.randomUUID();
}
router.route('/changeField').post(async function(req, res) {
    Provider.path('subCatID').required(false);
    Provider.path('subCatID').options.type = Object;
    returnData(res, "Ok");
});
    router.route('/checkAuth').post(async function(req, res) {
    const config = process.env;
    var tokenMe = req.headers["x-access-token"];
    if (!tokenMe) {
        res.status(202).send({status: 403, error: "Token is not sent"});
    }else{
        try {
            const decoded = jwt.verify(tokenMe, config.JWT_KEY);
            req.user = decoded;
            req.user.userID
            var user = await Provider.findOne({id: userID});
            return res.status(200).send(user);
          } catch (err) {
            try{
                if(err.name === 'TokenExpiredError') {
                    const payload = jwt.verify(tokenMe, config.JWT_KEY, {ignoreExpiration: true} );
                    var userID = payload.userID;
                    var user = await Provider.findOne({id: userID});
                    var email = user.email;
                    let token = jwt.sign(
                        { userID: id, email: email, country: country },
                            process.env.JWT_KEY,
                        {
                           expiresIn: "24h",
                        }
                       );
                       user.token = token;
                       return res.status(200).send(user);
    
                }else{
                    return res.status(401).send({status: 401, error: "Token is not valid ."});
                }
            }catch(err){
                return res.status(401).send({status: 401, error: "Token is not valid "+ err.message});

            }

          }
    }

});
router.route('/loginSocial').post(myAuth ,function(req, res) {
    let username = req.body.username;
    let fcmToken = req.body.fcmToken;
    if (username){
        Provider.findOne({$or :[{ username: username },{ email: username }]} ,function (err, item) {
            if (item && item.password) {
                let password = process.env.SOCIALPASS;
                if (!bcrypt.compareSync(password, item.password)){
                    return returnError(res , "Wrong password");
                }
                let token = getToken(item.id , item.email , item.countryOfResidence);
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
router.route('/login').post(myAuth ,function(req, res) {
    let username = req.body.username;
    let fcmToken = req.body.fcmToken;
    if (username){
        Provider.findOne({$or :[{ username: username },{ email: username }]} ,function (err, item) {
            if (item && item.password) {
                let password = req.body.password;
                if (!bcrypt.compareSync(password, item.password)){
                    return returnError(res , "Wrong password");
                }
                let token = getToken(item.id , item.email , item.countryOfResidence);
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
router.post('/SocialRegister', [uploadAll , myAuth] ,async function( req, res, next) {
    try {
    const DOMAIN = process.env.DOMAIN_ME;
    let body = Provider(JSON.parse(req.body.data));
    const {profilePic} = req.files;
    if(profilePic){
        for(const item of profilePic){
            body.profilePic = DOMAIN+'uploads/profilePic/'+item.filename;
        }
    }
    body.id = uuidv4();
    console.log(body);
    if(body){
        const {id , email , phone} = body
        let oldUser = await Provider.findOne({$or:[{id: id},{email:email},{phone:phone}]});
        if (oldUser) {
			return returnError(res , "This user already registered, duplicate email , username , id or mobile number");
        }else{
            body.password = process.env.SOCIALPASS;
            let encryptedPassword = await bcrypt.hash(body.password, 10);
            body.password = encryptedPassword;
            let token = getToken(body.id , body.email , body.countryOfResidence);
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
router.post('/EasyRegister', [uploadAll , myAuth] ,async function( req, res, next) {
    try {
    const DOMAIN = process.env.DOMAIN_ME;
    let body = Provider(JSON.parse(req.body.data));
    const {profilePic} = req.files;
    if(profilePic){
        for(const item of profilePic){
            body.profilePic = DOMAIN+'uploads/profilePic/'+item.filename;
        }
    }else{
        body.profilePic = "";
    }
  
    body.id = uuidv4();
    console.log(body);
    if(body){
        const {id , email , phone} = body
        let oldUser = await Provider.findOne({$or:[{id: id},{email:email},{phone:phone}]});
        if (oldUser) {
			return returnError(res , "This user already registered, duplicate email , username , id or mobile number");
        }else{
            let encryptedPassword = await bcrypt.hash(body.password, 10);
            body.password = encryptedPassword;
            let token = getToken(body.id , body.email , body.countryOfResidence);
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
    }else{
        body.photos = [];
    }
    if(videos){
        let list = [];
        for(const item of videos){
            list.push(DOMAIN+'uploads/videos/'+item.filename);
        }
        body.videos = list;
    }else{
        body.videos = [];
    }
    if(audios){
        let list = [];
        for(const item of audios){
            list.push(DOMAIN+'uploads/audios/'+item.filename);
        }
        body.audios = list;
    }else{
        body.audios = [];
    }
    if(onevideo){
        let list = [];
        for(const item of onevideo){
            list.push(DOMAIN+'uploads/onevideo/'+item.filename);
        }
        if(list)
            body.oneMinuteVideo = list[0]
    }else{
        body.oneMinuteVideo = "";
    }
    if(reel){
        let list = [];
        for(const item of reel){
            list.push(DOMAIN+'uploads/reel/'+item.filename);
        }
        if(list)
            body.demoReel = list[0]
    }else{
        body.demoReel = "";
    }
    if(resumeCV){
        let list = [];
        for(const item of resumeCV){
            list.push(DOMAIN+'uploads/resumeCV/'+item.filename);
        }
        if(list)
            body.resume = list[0]
    }else{
        body.resume = "";
    }
    if(portfolio){
        let list = [];
        for(const item of portfolio){
            list.push(DOMAIN+'uploads/portfolio/'+item.filename);
        }
        if(list)
            body.portfolio = list[0]
    }else{
        body.portfolio = "";
    }
    body.id = uuidv4();
    console.log(body);
    if(body){
        const {id , email , phone} = body
        let oldUser = await Provider.findOne({$or:[{id: id},{email:email},{phone:phone}]});
        if (oldUser) {
			return returnError(res , "This user already registered, duplicate email , username , id or mobile number");
        }else{
            let encryptedPassword = await bcrypt.hash(body.password, 10);
            body.password = encryptedPassword;
            let token = getToken(body.id , body.email , body.countryOfResidence);
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

router.post('/GetEvents',auth , async function (req, res) {
    try{
        // Event.find({},function(err , items){
        //     if(err){
        //         return returnError(res, "Failed"+err);
        //     }else {
        //         return returnData(res, items);
        //     }
        // });
        // Use aggregate to perform a lookup between two models
        Event.aggregate([
        {
        $lookup: {
            from: 'users', // name as mongo named it with s at last
            localField: 'userID',
            foreignField: 'id',
            as: 'userDetails'
        }
        },
        {
        $unwind: {
            path: '$userDetails',
            preserveNullAndEmptyArrays: true
        }
        },
        {
        $project: {
            id: 1,
            title: 1,
            desc: 1,
            createdDate: 1,
            eventDate: 1,
            userID: 1,
            providerID: 1,
            catID: 1,
            subCatID: 1,
            duration: 1,
            averageCost: 1,
            country: 1,
            dealCost: 1,
            status: 1,
            userName: '$userDetails.name'
        }
        }
    ]).exec((err, results) => {
        if (err) {
            console.error(err);
            return returnError(res, "Failed"+err);
        }
    
        return returnData(res, results);
    });
    }catch(err){
        return returnError(res, "Failed"+err);
    }
});

router.post('/GetOneEvent',auth , async function (req, res) {
    try{
        var eventID = req.body.eventID;
        var userID = req.body.userID;
        Event.findOne({id: eventID}, async function(err , item){
            if(err){
                return returnError(res, "Failed"+err);
            }else {
                if(item){
                    var user = await User.findOne({id: userID});
                    item.userName = user.name;
                    return returnData(res, item);
                }
            }
        }).lean();
    }catch(err){
        return returnError(res, "Failed"+err);
    }
});
router.post('/getMessagesProfiles', auth, function (req, res) {
    try{
        const userID = req.user.userID;
        Message.find({providerID: userID}, async function(err , items){
            if(err){
                returnError(res , err);
            }else{

                const ids = items.map(({ userID }) => userID);
                const filtered = items.filter(({ userID }, index) =>
                !ids.includes(userID, index + 1));
                var response = [];
                for(const item of filtered){
                    const sender = await User.findOne({id: item.userID});
                    var data = {};
                    data.messageID = item.id;
                    data.senderID = item.userID;
                    data.senderName = sender.name;
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
        const employer = req.body.userID;
        Message.find({providerID: userID , userID: employer}, async function(err , items){
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

router.post('/sendMessage', auth, async function (req, res) {
    try{
        const message = Message(req.body); 
        if(message){
            message.id = crypto.randomUUID();
            message.providerID = req.user.userID;
            message.senderID = req.user.userID;
            message.msgDate = Date.now();
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
        const providerID = req.user.userID;
        Event.find({providerID: providerID}, async function(err , items){
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

router.post('/GetReviews',auth, function (req, res) {
    try{
        const providerID = req.user.userID;
        const userID = req.body.userID;
        Reviews.find({userID: userID, providerID: providerID},function(err , items){
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
router.post('/GetMyReviews',auth, function (req, res) {
    try{
        const providerID = req.user.userID;
        Reviews.find({providerID: providerID , isProvider: false},function(err , items){
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
        const providerID = req.user.userID;
        review.providerID = providerID;
        review.isProvider = true;
        var oldReview = await Reviews.findOne({userID: review.userID, providerID: providerID , isProvider: true });
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



router.post('/getAllProvider', function (req, res) {
    Provider.find({} , function(err, items){
        returnData(res , items);
    });
});

router.post('/UpdateProvider', [auth ,uploadAll] ,async function( req, res, next) {
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
    }else{
        body.photos = [];
    }
    if(videos){
        let list = [];
        for(const item of videos){
            list.push(DOMAIN+'uploads/videos/'+item.filename);
        }
        body.videos = list;
    }else{
        body.videos = [];
    }
    if(audios){
        let list = [];
        for(const item of audios){
            list.push(DOMAIN+'uploads/audios/'+item.filename);
        }
        body.audios = list;
    }else{
        body.audios = [];
    }
    if(onevideo){
        let list = [];
        for(const item of onevideo){
            list.push(DOMAIN+'uploads/onevideo/'+item.filename);
        }
        if(list)
            body.oneMinuteVideo = list[0]
    }else{
        body.oneMinuteVideo = "";
    }
    if(reel){
        let list = [];
        for(const item of reel){
            list.push(DOMAIN+'uploads/reel/'+item.filename);
        }
        if(list)
            body.demoReel = list[0]
    }else{
        body.demoReel = "";
    }
    if(resumeCV){
        let list = [];
        for(const item of resumeCV){
            list.push(DOMAIN+'uploads/resumeCV/'+item.filename);
        }
        if(list)
            body.resume = list[0]
    }else{
        body.resume = "";
    }
    if(portfolio){
        let list = [];
        for(const item of portfolio){
            list.push(DOMAIN+'uploads/portfolio/'+item.filename);
        }
        if(list)
            body.portfolio = list[0]
    }else{
        body.portfolio = "";
    }
    body.id = uuidv4();
    console.log(body);
    if(body){
        const {id , email , phone} = body
        let oldUser = await Provider.findOne({$or:[{id: id},{email:email},{phone:phone}]});
        if (oldUser) {
            body.email = oldUser.email;
            body.id = oldUser.id;
            body._id = oldUser._id;
            body._v = oldUser._v;
            let password = body.password;
            if (!bcrypt.compareSync(password, oldUser.password)){
                return returnError(res , "Wrong password");
            }
            let encryptedPassword = await bcrypt.hash(body.password, 10);
            body.password = encryptedPassword;
            const doc = await Provider.findOneAndUpdate({$or:[{id: id},{email:email}]}, body, {
                new: true
              });
            if(doc){
                doc.password = "******";
                return returnData(res , doc);
            }else{
                return returnError(res , "Error occured");
            }
        }else{
            return returnError(res , "User not found");
        }
    }else{
        return returnError(res , "Info not detected");
    }
            
 } catch (error) {
    return returnError(res , "Error "+error);
  }
});

router.post('/RequestConnection', auth, async function (req, res) {
    try{
        const eventID = req.body.eventID;
        const userID = req.body.userID;
        if(userID && eventID){
            var message = Message();
            message.id = crypto.randomUUID();
            message.msg = "";
            message.type = 4;
            message.providerID = req.user.userID;
            message.eventID = eventID;
            message.userID = userID;
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

function getToken(id , email , country){
    return jwt.sign(
        { userID: id, email: email, country: country },
        process.env.JWT_KEY,
        {
            expiresIn: "24h",
        }
    );
}
function returnError(res , error){
    console.log(error);
    return res.status(203).send({status: 203 , data: error});
}
function returnData(res , data){
    console.log(data);
    return res.status(200).send({status: 200 , data: data});
}


module.exports = router;
