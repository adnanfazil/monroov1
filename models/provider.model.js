var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var musicalInstruments = require('../models/musicalInstruments.model').schema;
var musicGenres = require('../models/musicgeners.model').schema;
var subCategories = require('../models/subcategory.model').schema;



const schema = new Schema({
   id: {type: String , unique: true},
   catID: {type: String , default: ""},
   subCatID: {type: [subCategories] , default: []},
   fname: {type: String , default: ""},
   lname: {type: String , default: ""},
   gender: {type: Number, default: 0}, // 1: Male , 2: Female
   isActive: {type: Boolean, default: false},
   username: {type: String, default: ""},
   password: {type: String, default: ""},
   registerDate: {type: String, default: ""},
   phone: {type: String, default: ""},
   email: {type: String, default: ""},
   dob: {type: String , default: ""},
   nationality: {type: String , default: ""},
   education: {type: String , default: ""},
   averageRatePerHour: {type: String , default: ""},
   openToWorkInCountry: {type: [String] , default: []},
   countryOfResidence: {type: String, default: ""},
   spokenLanguage: {type: String, default: ""},
   experience: {type: String, default: ""},
   visaType: {type: String, default: ""},
   instagram: {type: String, default: ""},
   photos: {type: [String], default: []},
   introductionVideoLink: {type: String, default: ""},
   youtubelink: {type: String, default: ""},
   videos: {type: [String], default: []},
   bio: {type: String, default: ""}, // 200 words max
   workLink: {type: String, default: ""},
   linkedin: {type: String, default: ""},
   height: {type: String, default: ""},
   weight: {type: String, default: ""},
   resume: {type: String, default: ""},
   portfolio: {type: String, default: ""},
   isAmodel: {type: Boolean, default: false}, // to show four types of images (face close shot, waist up, shouder up , full lentgh )
   oneMinuteVideo: {type: String, default: ""},
   audios: {type: [String], default: []},
   musicalInstruments: {type: [musicalInstruments], default: []},
   musicGenres: {type: [musicGenres], default: []},
   specialSkills: {type: String, default: ""},
   demoReel: {type: String, default: ""},
   token: {type: String, default: ""},
   fcmToken: {type: String, default: ""}

});


module.exports = mongoose.model('Provider', schema);