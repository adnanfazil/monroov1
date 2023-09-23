var mongoose = require('mongoose');
var Schema = mongoose.Schema;


const schema = new Schema({
   id: {type: String , unique: true},
   catID: {type: Number , default: 0},
   subCatID: {type: Number , default: 0},
   fname: {type: Number , default: 0},
   lname: {type: Number , default: 0},
   gender: {type: Number, default: 0}, 
   isActive: {type: Number, default: 0},
   username: {type: Number, default: 0},
   password: {type: Number, default: 0},
   registerDate: {type: Number, default: 0},
   phone: {type: Number, default: 0},
   email: {type: Number, default: 0},
   dob: {type: Number , default: 0},
   nationality: {type: Number , default: 0},
   education: {type: Number , default: 0},
   averageRatePerHour: {type: Number , default: 0},
   openToWorkInCountry: {type: Number , default: 0},
   countryOfResidence: {type: Number, default: 0},
   spokenLanguage: {type: Number, default: 0},
   experience: {type: Number, default: 0},
   visaType: {type: Number, default: 0},
   instagram: {type: Number, default: 0},
   photos: {type: Number, default: 0},
   introductionVideoLink: {type: Number, default: 0},
   youtubelink: {type: Number, default: 0},
   videos: {type: Number, default: 0},
   bio: {type: Number, default: 0}, // 200 words max
   workLink: {type: Number, default: 0},
   linkedin: {type: Number, default: 0},
   height: {type: Number, default: 0},
   weight: {type: Number, default: 0},
   resume: {type: Number, default: 0},
   portfolio: {type: Number, default: 0},
   isAmodel: {type: Number, default: 0}, // to show four types of images (face close shot, waist up, shouder up , full lentgh )
   oneMinuteVideo: {type: Number, default: 0},
   audios: {type: Number, default: 0},
   musicalInstruments: {type: Number, default: 0},
   musicGenres: {type: Number, default: 0},
   specialSkills: {type: Number, default: 0},
   demoReel: {type: Number, default: 0},
   token: {type: Number, default: 0},
   fcmToken: {type: Number, default: 0}

});


module.exports = mongoose.model('ProviderLook', schema);