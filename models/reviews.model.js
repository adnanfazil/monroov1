var mongoose = require('mongoose');
var Schema = mongoose.Schema;


const schema = new Schema({
   id: {type: String , unique: true},
   userID: {type: String , default: ""},
   providerID: {type: String , default: ""},
   stars: {type: Number , default: 0},
   comment: {type: String , default: ""},
   isProvider: {type: Boolean , default: false}
});


module.exports = mongoose.model('Reviews', schema);