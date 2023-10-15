var mongoose = require('mongoose');
var Schema = mongoose.Schema;


const schema = new Schema({
   id: {type: String , unique: true}, // false hide - true show
   catID: {type: Boolean , default: false},
   subCatID: {type: Boolean , default: false},
   fname: {type: Boolean , default: false},
   lname: {type: Boolean , default: false},
   gender: {type: Boolean, default: false}, 
   isActive: {type: Boolean, default: false},
   username: {type: Boolean, default: false},
   password: {type: Boolean, default: false},
   registerDate: {type: Boolean, default: false},
   phone: {type: Boolean, default: false},
   email: {type: Boolean, default: false},
   dob: {type: Boolean , default: false},
   nationality: {type: Boolean , default: false},
   education: {type: Boolean , default: false},
   averageRatePerHour: {type: Boolean , default: false},
   openToWorkInCountry: {type: Boolean , default: false},
   countryOfResidence: {type: Boolean, default: false},
   spokenLanguage: {type: Boolean, default: false},
   experience: {type: Boolean, default: false},
   visaType: {type: Boolean, default: false},
   instagram: {type: Boolean, default: false},
   photos: {type: Boolean, default: false},
   introductionVideoLink: {type: Boolean, default: false},
   youtubelink: {type: Boolean, default: false},
   videos: {type: Boolean, default: false},
   bio: {type: Boolean, default: false}, // 200 words max
   workLink: {type: Boolean, default: false},
   linkedin: {type: Boolean, default: false},
   height: {type: Boolean, default: false},
   weight: {type: Boolean, default: false},
   resume: {type: Boolean, default: false},
   portfolio: {type: Boolean, default: false},
   isAmodel: {type: Boolean, default: false}, // to show four types of images (face close shot, waist up, shouder up , full lentgh )
   oneMinuteVideo: {type: Boolean, default: false},
   audios: {type: Boolean, default: false},
   musicalInstruments: {type: Boolean, default: false},
   musicGenres: {type: Boolean, default: false},
   specialSkills: {type: Boolean, default: false},
   demoReel: {type: Boolean, default: false},
   token: {type: Boolean, default: false},
   fcmToken: {type: Boolean, default: false}

});


module.exports = mongoose.model('ProviderLook', schema);