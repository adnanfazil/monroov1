var mongoose = require('mongoose');
var Schema = mongoose.Schema;


const schema = new Schema({
   id: {type: String , unique: true},
   fname: {type: String , default: ""},
   lname: {type: String , default: ""},
   dob: {type: String , default: ""},
   nationality: {type: String , default: ""},
   education: {type: String , default: ""},
   averageRatePerHour: {type: String , default: ""},
   openToWorkInCountry: {type: String , default: ""},
   countryOfResidence: {type: String, default: ""},
   spokenLanguage: {type: String, default: ""},
   experience: {type: String, default: ""},
   visaType: {type: String, default: ""},
   instagram: {type: String, default: ""},
   photos: {type: [String], default: []},
   introductionVideoLink: {type: String, default: ""},
   gender: {type: Number, default: 0}, // 1: Male , 2: Female
   isActive: {type: Boolean, default: false},
   username: {type: String, default: ""},
   password: {type: String, default: ""},
   registerDate: {type: String, default: ""},
   phone: {type: String, default: ""},
   email: {type: String, default: ""},
   token: {type: String, default: ""},
   fcmToken: {type: String, default: ""}
});


module.exports = mongoose.model('Provider', schema);