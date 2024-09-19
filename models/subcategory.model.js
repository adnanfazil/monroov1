var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const schema = new Schema({
  id: { type: String, unique: true },
  name: { type: String, default: "" },
  nameAR: { type: String, default: "" },
  nameRUS: { type: String, default: "" },
  catID: { type: String, ref: "Category", default: "" }, // Changed from catID to categoryId and added ref
});

module.exports = mongoose.model("SubCategory", schema);
