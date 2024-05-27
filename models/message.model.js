var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var event = require('../models/eventMsg.model').schema;


const schema = new Schema({
   id: {type: String , unique: true},
   msg: {type: String , default: ""},
   type: {type: Number , default: 0}, // 1 - Request Event , 2 - Normal Message , 3 - Approve Request, 4 - requestFrom provider(connection) , 5 - Request A Deal (Make A deal), 6 - Approve A Deal (Approve A deal)
   providerID: {type: String , default: ""},
   userID: {type: String , default: ""},
   senderID: {type: String , default: ""},
   eventID: {type: String , default: ""},
   msgDate: {type: String , default: ""},
   eventObj: {type: event, default: null},
   msgStatus: {type: Number, default: 1},// 1 - still / normal , 2- Approved , 3- rejected/declined , 4- DealSent , 5- DealApproved  , 5- Payed
});


module.exports = mongoose.model('Message', schema);