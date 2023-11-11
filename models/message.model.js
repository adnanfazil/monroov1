var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var event = require('../models/event.model').schema;


const schema = new Schema({
   id: {type: String , unique: true},
   msg: {type: String , default: ""},
   type: {type: Number , default: ""}, // 1 - Request Event , 2 - Normal Message , 3 - Approve Request
   providerID: {type: String , default: ""},
   userID: {type: String , default: ""},
   senderID: {type: String , default: ""},
   eventID: {type: String , default: ""},
   eventObj: {type: event, default: null},
});


module.exports = mongoose.model('Message', schema);