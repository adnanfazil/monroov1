var express = require('express');
var router = express.Router();
var Category = require('../models/category.model');
var SubCategory = require('../models/subcategory.model');
var Education = require('../models/edu.model');
var ProviderLook = require('../models/providerlookups');
let upload = require("../middleware/multerUpload");
let uploadOne = require("../middleware/multerUploadSingle");
let jwt = require('jsonwebtoken');
let auth = require("../middleware/auth");
let bcrypt = require('bcryptjs');
const crypto = require('crypto');
function uuidv4() {
    return crypto.randomUUID();
}

//////////// Categories
router.route('/addCategory').post(auth, async function(req, res) {
    try{
        let body = Category(req.body);
        body.id = uuidv4();
        if(body){
            body.save(function (err) {
                if (err) {
                    return returnError(res , "Cannot Save "+ err);
                 }else{
                    return returnData(res , body);
		        }
               });
        }else{
            throw Error("No Data Received")
        }
    }catch(ex){
        returnError(res , ex);
    }
});


router.route('/addCategories').post(auth,async function(req, res) {
    try{
        var response = await Category.collection.insertMany(books);
        returnData(res , response);
    }catch(ex){
        returnError(res , ex);
    }
});


router.route('/getCategories').post(auth,function(req, res) {
    try{
        Category.find(function (err, item) {
            if(err){
                returnError(res, err);
            }else{
                returnData(res, item);
            }
        });
    }catch(ex){
        returnError(res , ex);
    }
});


//////////// Sub Categories
router.route('/addSubCategory').post(auth, async function(req, res) {
    try{
        let body = SubCategory(req.body);
        body.id = uuidv4();
        if(body){
            body.save(function (err) {
                if (err) {
                    return returnError(res , "Cannot Save "+ err);
                 }else{
                    return returnData(res , body);
		        }
               });
        }else{
            throw Error("No Data Received")
        }
    }catch(ex){
        returnError(res , ex);
    }
});


router.route('/addSubCategories').post(auth,async function(req, res) {
    try{
        var response = await SubCategory.collection.insertMany(books);
        returnData(res , response);
    }catch(ex){
        returnError(res , ex);
    }
});


router.route('/getSubCategories').post(auth,function(req, res) {
    try{
        SubCategory.find(function (err, item) {
            if(err){
                returnError(res, err);
            }else{
                returnData(res, item);
            }
        });
    }catch(ex){
        returnError(res , ex);
    }
});

//////////// Educations
router.route('/addEducation').post(auth,function(req, res) {
    try{
        let body = Education(req.body);
        body.id = uuidv4();
        if(body){
            body.save(function (err) {
                if (err) {
                    return returnError(res , "Cannot Save "+ err);
                 }else{
                    return returnData(res , body);
		        }
               });
        }else{
            throw Error("No Data Received")
        }
    }catch(ex){
        returnError(res , ex);
    }
});


router.route('/addEducations').post(auth,async function(req, res) {
    try{
        var response = await Education.collection.insertMany(books);
        returnData(res , response);
    }catch(ex){
        returnError(res , ex);
    }
});


router.route('/getEducations').post(auth,function(req, res) {
    try{
        Education.find(function (err, item) {
            if(err){
                returnError(res, err);
            }else{
                returnData(res, item);
            }
        });
    }catch(ex){
        returnError(res , ex);
    }
});


//////////// Provider Lookups
router.route('/AddProviderLookup').post(auth,async function(req, res) {
    try{
        let body = ProviderLook(req.body);
        var catID = body.catID
        var subCatID = body.subCatID;
        var category = await Category.find({id: catID});
        var subCategory = await SubCategory.find({id: subCatID});
        if(!category || !subCategory){
            throw Error("Cat ID or Sub Cat ID not exist" + !category + !subCategory);
        }
        body.id = uuidv4();
        if(body){
            body.save(function (err) {
                if (err) {
                    return returnError(res , "Cannot Save "+ err);
                 }else{
                    return returnData(res , body);
		        }
               });
        }else{
            throw Error("No Data Received")
        }
    }catch(ex){
        returnError(res , ex);
    }
});


router.route('/AddProviderLookups').post(auth,async function(req, res) {
    try{
        var response = await ProviderLook.collection.insertMany(books);
        returnData(res , response);
    }catch(ex){
        returnError(res , ex);
    }
});


router.route('/GetProviderLookups').post(auth,function(req, res) {
    try{
        ProviderLook.find(function (err, item) {
            if(err){
                returnError(res, err);
            }else{
                returnData(res, item);
            }
        });
    }catch(ex){
        returnError(res , ex);
    }
});



function returnError(res , error){
    return res.status(203).send({status: 203 , data: error});
}

function returnData(res , data){
    return res.status(200).send({status: 200 , data: data});
}





module.exports = router;
