var express = require('express');
var router = express.Router();
var Category = require('../models/category.model');
var SubCategory = require('../models/subcategory.model');
var Education = require('../models/edu.model');
var ProviderLook = require('../models/providerlookups');
let upload = require("../middleware/multerUpload");
let uploadOne = require("../middleware/multerUploadSingle");
let jwt = require('jsonwebtoken');
let myAuth = require("../middleware/myAuth");
let bcrypt = require('bcryptjs');
const crypto = require('crypto');
function uuidv4() {
    return crypto.randomUUID();
}

//////////// Categories
router.route('/addCategory').post(myAuth, async function(req, res) {
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
            throw Error("No Data Received");
        }
    }catch(ex){
        returnError(res , ex.message);
    }
});


router.route('/addCategories').post(myAuth,async function(req, res) {
    try{
        var bodyList = req.body;
        if(bodyList){
        //     bodyList.forEach(element => {
        //         element.id = uuidv4();
            // });
        }else{
            throw Error("Empty body");
        }
        var response = await Category.collection.insertMany(bodyList);
        returnData(res , response);
    }catch(ex){
        returnError(res , ex.message);
    }
});


router.route('/getCategories').post(myAuth,function(req, res) {
    try{
        Category.find(function (err, item) {
            if(err){
                returnError(res, err);
            }else{
                returnData(res, item);
            }
        });
    }catch(ex){
        returnError(res , ex.message);
    }
});

router.route('/getCatSubCatName').post(myAuth,async function(req, res) {
    try{
        var catID = req.body.catID;
        var subCatID = req.body.subCatID;
        if(!catID || !subCatID)
        {
            returnError(res, "plz provide ids");
            return;
        }
        var category = await Category.findOne({id: catID});
        var subCategory = await SubCategory.find({id: {"$in": subCatID}});
        if(category && subCategory){
            var obj = {};
            obj.category = category;
            obj.subCategory = subCategory;
            returnData(res, obj);
            return;
        }else{
            returnError(res, "Category not found");
            return;
        }
    }catch(ex){
        returnError(res , ex.message);
    }
});


//////////// Sub Categories
router.route('/addSubCategory').post(myAuth, async function(req, res) {
    try{
        let body = SubCategory(req.body);
        body.id = uuidv4();
        var catID = body.catID;
        var category = await Category.findOne({id: catID});
        if(!category){
            throw Error("Category ID is not correct");
        }
        if(body){
            body.save(function (err) {
                if (err) {
                    return returnError(res , "Cannot Save "+ err);
                 }else{
                    return returnData(res , body);
		        }
               });
        }else{
            throw Error("No Data Received");
        }
    }catch(ex){
        returnError(res , ex.message);
    }
});


router.route('/addSubCategories').post(myAuth,async function(req, res) {
    try{
        var bodyList = req.body;
        if(bodyList){
            // bodyList.forEach(element => {
            //     element.id = uuidv4();
            // });
        }else{
            throw Error("Empty body");
        }
        var response = await SubCategory.collection.insertMany(bodyList);
        returnData(res , response);
    }catch(ex){
        returnError(res , ex.message);
    }
});


router.route('/getSubCategories').post(myAuth,function(req, res) {
    try{
        var catID = req.body.catID;
        if(!catID){
            throw Error("Add Category Id");
        }
        SubCategory.find({catID : catID},function (err, item) {
            if(err){
                returnError(res, err);
            }else{
                returnData(res, item);
            }
        });
    }catch(ex){
        returnError(res , ex.message);
    }
});


router.route('/getAllSubCategories').post(myAuth,function(req, res) {
    try{
        SubCategory.find(function (err, item) {
            if(err){
                returnError(res, err);
            }else{
                returnData(res, item);
            }
        });
    }catch(ex){
        returnError(res , ex.message);
    }
});

//////////// Educations
router.route('/addEducation').post(myAuth,function(req, res) {
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
            throw Error("No Data Received");
        }
    }catch(ex){
        returnError(res , ex.message);
    }
});


router.route('/addEducations').post(myAuth,async function(req, res) {
    try{
        var bodyList = req.body;
        if(bodyList){
            bodyList.forEach(element => {
                element.id = uuidv4();
            });
        }else{
            throw Error("Empty body");
        }
        var response = await Education.collection.insertMany(bodyList);
        returnData(res , response);
    }catch(ex){
        returnError(res , ex.message);
    }
});


router.route('/getEducations').post(function(req, res) {
    try{
        Education.find(function (err, item) {
            if(err){
                returnError(res, err);
            }else{
                returnData(res, item);
            }
        });
    }catch(ex){
        returnError(res , ex.message);
    }
});


//////////// Provider Lookups
router.route('/AddProviderLookup').post(myAuth,async function(req, res) {
    try{
        let body = ProviderLook(req.body);
        var catID = body.catID;
        var subCatID = body.subCatID;
        var category = await Category.find({id: catID});
        var subCategory = await SubCategory.find({id: subCatID});
        if(!category || !subCategory){
            throw Error("Cat ID or Sub Cat ID not exist " + !category + !subCategory);
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
            throw Error("No Data Received");
        }
    }catch(ex){
        returnError(res , ex.message);
    }
});


router.route('/AddCollectionProviderLookups').post(myAuth,async function(req, res) {
    try{
        var bodyList = req.body;
        if(bodyList){
            await bodyList.forEach(element => {
                element.id = uuidv4();
            });
        }else{
            throw Error("Empty body");
        }
        var response = await ProviderLook.collection.insertMany(bodyList);
        returnData(res , response);
    }catch(ex){
        returnError(res , ex.message);
    }
});


router.route('/UpdateCategoyInProvide').post(myAuth,function(req, res) {
    try{
        const  {catID, subCatID } = req.body;
        if(!subCatID || !catID){
            returnError(res, "cat id or sub cat idnot sent");
            return;
        }
        ProviderLook.findOne({subCatID: subCatID} ,function (err, item) {
            if(err){
                returnError(res, err);
            }else{
                if(item){
                    item.catID = catID; 
                    item.save();
                    returnData(res, item);
                }else{
                    returnError(res, "item not found");
                }
            }
        });
    }catch(ex){
        returnError(res , ex.message);
    }
});

router.route('/GetProviderLookups').post(myAuth,function(req, res) {
    try{
        const { catID, subCatID } = req.body;
        if(!catID || !subCatID){
            returnError(res, "cat id or sub cat idnot sent");
            return;
        }
        ProviderLook.findOne({catID: catID , subCatID: subCatID} ,function (err, item) {
            if(err){
                returnError(res, err);
            }else{
                if(item){
                    returnData(res, item);
                }else{
                    returnError(res, "item not found");
                }
            }
        });
    }catch(ex){
        returnError(res , ex.message);
    }
});
router.route('/GetAllProviderLookups').post(myAuth,function(req, res) {
    try{
        ProviderLook.find(function (err, item) {
            if(err){
                returnError(res, err);
            }else{
                returnData(res, item);
            }
        });
    }catch(ex){
        returnError(res , ex.message);
    }
});



function returnError(res , error){
    return res.status(203).send({status: 203 , data: error});
}

function returnData(res , data){
    return res.status(200).send({status: 200 , data: data});
}





module.exports = router;
