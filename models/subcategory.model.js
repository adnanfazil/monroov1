var mongoose = require('mongoose');
var Schema = mongoose.Schema;


const schema = new Schema({
   id: {type: String , default: ""},
   name: {type: String , default: ""},
   nameAR: {type: String , default: ""},
   nameRUS: {type: String , default: ""},
   catID: {type: String , default: ""},
});


module.exports = mongoose.model('SubCategory', schema);