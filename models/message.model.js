var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var event = require('../models/eventMsg.model').schema;


const schema = new Schema({
   id: {type: String , unique: true},
   msg: {type: String , default: ""},
   type: {type: Number , default: ""}, // 1 - Request Event , 2 - Normal Message , 3 - Approve Request, 4 - requestFrom provider(connection)
   providerID: {type: String , default: ""},
   userID: {type: String , default: ""},
   senderID: {type: String , default: ""},
   eventID: {type: String , default: ""},
   msgDate: {type: String , default: ""},
   eventObj: {type: event, default: null},
},{strict:false});


module.exports = mongoose.model('Message', schema);