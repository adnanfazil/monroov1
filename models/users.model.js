var mongoose = require('mongoose');
var Schema = mongoose.Schema;


const schema = new Schema({
   id: {type: String , unique: true},
   name: {type: String , default: ""},
   country: {type: String, default: ""},
   isActive: {type: Boolean, default: false},
   username: {type: String, default: ""},
   password: {type: String, default: ""},
   registerDate: {type: String, default: ""},
   phone: {type: String, default: ""},
   email: {type: String, default: ""},
   token: {type: String, default: ""},
   fcmToken: {type: String, default: ""}
});


module.exports = mongoose.model('User', schema);