var express = require('express');
var router = express.Router();
var Category = require('../models/category.model');
let upload = require("../middleware/multerUpload");
let uploadOne = require("../middleware/multerUploadSingle");
let jwt = require('jsonwebtoken');
let bcrypt = require('bcryptjs');
const crypto = require('crypto');












module.exports = router;
