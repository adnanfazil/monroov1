var mongoose = require('mongoose');
var Schema = mongoose.Schema;


const schema = new Schema({
   title: {type: String , default: ""},
   desc: {type: String , default: ""},
   createdDate: {type: String , default: ""},
   eventDate: {type: String , default: ""},
   userID: {type: String , default: ""},
   providerID: {type: String , default: ""},
   catID: {type: String , default: ""},
   subCatID: {type: String , default: ""},
   duration: {type: String , default: ""},
   averageCost: {type: String , default: ""},
   country: {type: String , default: ""},
   dealCost: {type: String , default: ""},
   status: {type: Number , default: 0} // 0 = Pending, 1 = Booked, 2 = Done, 3 = Purchased
});


module.exports = mongoose.model('EventsMsg', schema);