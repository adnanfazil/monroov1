var mongoose = require('mongoose');
var Schema = mongoose.Schema;


const schema = new Schema({
   id: {type: String , unique: true},
   msg: {type: String , default: ""},
   type: {type: Number , default: ""}, // 1 - Request Event , 2 - Normal Message , 3 - Approve Request
   providerID: {type: String , default: ""},
   userID: {type: String , default: ""},
   eventID: {type: String , default: ""}
});


module.exports = mongoose.model('Message', schema);