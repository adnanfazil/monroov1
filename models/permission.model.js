var mongoose = require('mongoose');
var Schema = mongoose.Schema;


const schema = new Schema({
   id: {type: String , unique: true},
   userID: {type: String , default: ""},
   providerID: {type: String , default: ""},
   eventID: {type: String , default: ""},
   isAllowed: {type: Boolean , default: false}
},{strict:false});


module.exports = mongoose.model('Permission', schema);