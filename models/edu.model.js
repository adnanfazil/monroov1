var mongoose = require('mongoose');
var Schema = mongoose.Schema;


const schema = new Schema({
   id: {type: String , unique: true},
   name: {type: String , default: ""},
   nameAR: {type: String , default: ""},
   nameRUS: {type: String , default: ""}
});


module.exports = mongoose.model('Education', schema);