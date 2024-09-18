var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const schema = new Schema({
  id: { type: String, unique: true },
  name: { type: String, default: "" },
  profilePic: { type: String, default: "" },
  country: { type: String, default: "" }, // in our case we will always send UAE unless they will go with other country
  isActive: { type: Boolean, default: false }, // after verify the email, will be true
  username: { type: String, default: "" },
  password: { type: String, default: "" },
  registerDate: { type: String, default: "" },
  phone: { type: String, default: "" },
  email: { type: String, default: "" },
  about: { type: String, default: "" },
  companyName: { type: String, default: "" },
  intrestedList: { type: [String], default: "" }, // list of  categories ids // set after register to add list of intrest
  token: { type: String, default: "" },
  fcmToken: { type: String, default: "" },
  resetPasswordToken: { type: String, default: null }, // New field for reset password token
  resetPasswordExpires: { type: Date, default: null },
});

module.exports = mongoose.model("User", schema);
