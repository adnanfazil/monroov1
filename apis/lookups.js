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

/**
 * @swagger
 * tags:
 *   name: lookups
 *   description: Operations related to categories and subcategories and educations
 */

//////////// Categories
/**
 * @swagger
 * /monroo/apis/lookups/addCategory:
 *   post:
 *     summary: Add a new category
 *     tags: [lookups]
 *     requestBody:
 *       description: Details of the category to be added
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: The unique identifier of the category
 *                 example: "cat123"
 *               name:
 *                 type: string
 *                 description: The name of the category in English
 *                 example: "Technology"
 *               nameAR:
 *                 type: string
 *                 description: The name of the category in Arabic
 *                 example: "تكنولوجيا"
 *               nameRUS:
 *                 type: string
 *                 description: The name of the category in Russian
 *                 example: "Технология"
 *     responses:
 *       200:
 *         description: Successful response with the added category details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The ID of the new category
 *                 name:
 *                   type: string
 *                   description: The name of the category in English
 *                 nameAR:
 *                   type: string
 *                   description: The name of the category in Arabic
 *                 nameRUS:
 *                   type: string
 *                   description: The name of the category in Russian
 *       400:
 *         description: Bad request if required fields are missing or invalid
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /monroo/apis/lookups/addCategories:
 *   post:
 *     summary: Add multiple categories
 *     tags: [lookups]
 *     requestBody:
 *       description: List of categories to be added
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The unique identifier for the category
 *                   example: "cat123"
 *                 name:
 *                   type: string
 *                   description: The name of the category in English
 *                   example: "Technology"
 *                 nameAR:
 *                   type: string
 *                   description: The name of the category in Arabic
 *                   example: "تكنولوجيا"
 *                 nameRUS:
 *                   type: string
 *                   description: The name of the category in Russian
 *                   example: "Технология"
 *     responses:
 *       200:
 *         description: Successful response with details of the added categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 insertedCount:
 *                   type: integer
 *                   description: The number of categories inserted
 *       400:
 *         description: Bad request if the request body is empty or invalid
 *       500:
 *         description: Internal server error
 */
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



/**
 * @swagger
 * /monroo/apis/lookups/getCategories:
 *   get:
 *     summary: Retrieve all categories
 *     tags: [lookups]
 *     description: Get a list of all categories from the database.
 *     responses:
 *       200:
 *         description: A list of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The unique identifier of the category
 *                     example: "category123"
 *                   name:
 *                     type: string
 *                     description: The name of the category
 *                     example: "Technology"
 *                   nameAR:
 *                     type: string
 *                     description: The name of the category in Arabic
 *                     example: "تكنولوجيا"
 *                   nameRUS:
 *                     type: string
 *                     description: The name of the category in Russian
 *                     example: "Технология"
 *       500:
 *         description: Internal server error
 */
router.route('/getCategories').get(function(req, res) {
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

/**
 * @swagger
 * /monroo/apis/lookups/getCatSubCatName:
 *   post:
 *     summary: Retrieve a category and its associated subcategories by their IDs
 *     tags: [lookups]
 *     requestBody:
 *       description: IDs of the category and subcategories to retrieve
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               catID:
 *                 type: string
 *                 description: The unique identifier of the category
 *                 example: "cat123"
 *               subCatID:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: The unique identifiers of the subcategories
 *                 example: ["subCat123", "subCat456"]
 *     responses:
 *       200:
 *         description: Successful response with the category and subcategories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 category:
 *                   type: object
 *                   description: Details of the category
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: The unique identifier of the category
 *                     name:
 *                       type: string
 *                       description: The name of the category
 *                     nameAR:
 *                       type: string
 *                       description: The name of the category in Arabic
 *                     nameRUS:
 *                       type: string
 *                       description: The name of the category in Russian
 *                 subCategory:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: Details of each subcategory
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: The unique identifier of the subcategory
 *                       name:
 *                         type: string
 *                         description: The name of the subcategory
 *                       nameAR:
 *                         type: string
 *                         description: The name of the subcategory in Arabic
 *                       nameRUS:
 *                         type: string
 *                         description: The name of the subcategory in Russian
 *       400:
 *         description: Bad request if IDs are missing or invalid
 *       404:
 *         description: Category or subcategories not found
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /monroo/apis/lookups/addSubCategory:
 *   post:
 *     summary: Add a new subcategory
 *     tags: [lookups]
 *     requestBody:
 *       description: Details of the subcategory to be added
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: The unique identifier for the subcategory (will be auto-generated)
 *                 example: "subCat123"
 *               name:
 *                 type: string
 *                 description: The name of the subcategory in English
 *                 example: "Software"
 *               nameAR:
 *                 type: string
 *                 description: The name of the subcategory in Arabic
 *                 example: "برمجيات"
 *               nameRUS:
 *                 type: string
 *                 description: The name of the subcategory in Russian
 *                 example: "Программное обеспечение"
 *               catID:
 *                 type: string
 *                 description: The unique identifier of the associated category
 *                 example: "cat123"
 *     responses:
 *       200:
 *         description: Successful response with the added subcategory details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The unique identifier of the new subcategory
 *                 name:
 *                   type: string
 *                   description: The name of the subcategory in English
 *                 nameAR:
 *                   type: string
 *                   description: The name of the subcategory in Arabic
 *                 nameRUS:
 *                   type: string
 *                   description: The name of the subcategory in Russian
 *                 catID:
 *                   type: string
 *                   description: The unique identifier of the associated category
 *       400:
 *         description: Bad request if required fields are missing or invalid
 *       404:
 *         description: Not Found if the associated category does not exist
 *       500:
 *         description: Internal server error
 */
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


/**
 * @swagger
 * /monroo/apis/lookups/addSubCategories:
 *   post:
 *     summary: Add multiple subcategories
 *     tags: [lookups]
 *     requestBody:
 *       description: List of subcategories to be added
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The unique identifier for the subcategory (will be auto-generated)
 *                   example: "subCat123"
 *                 name:
 *                   type: string
 *                   description: The name of the subcategory in English
 *                   example: "Software"
 *                 nameAR:
 *                   type: string
 *                   description: The name of the subcategory in Arabic
 *                   example: "برمجيات"
 *                 nameRUS:
 *                   type: string
 *                   description: The name of the subcategory in Russian
 *                   example: "Программное обеспечение"
 *                 catID:
 *                   type: string
 *                   description: The unique identifier of the associated category
 *                   example: "cat123"
 *     responses:
 *       200:
 *         description: Successful response with the result of the inserted subcategories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 acknowledged:
 *                   type: boolean
 *                   description: Indicates if the operation was acknowledged
 *                 insertedCount:
 *                   type: integer
 *                   description: Number of subcategories inserted
 *                 insertedIds:
 *                   type: array
 *                   items:
 *                     type: string
 *                     description: The unique identifiers of the inserted subcategories
 *       400:
 *         description: Bad request if the request body is empty or invalid
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /monroo/apis/lookups/getSubCategories:
 *   post:
 *     summary: Retrieve subcategories by category ID
 *     tags: [lookups]
 *     requestBody:
 *       description: The category ID for which to retrieve subcategories
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               catID:
 *                 type: string
 *                 description: The unique identifier of the category
 *                 example: "cat123"
 *     responses:
 *       200:
 *         description: Successful response with a list of subcategories for the specified category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The unique identifier of the subcategory
 *                     example: "subCat123"
 *                   name:
 *                     type: string
 *                     description: The name of the subcategory in English
 *                     example: "Software"
 *                   nameAR:
 *                     type: string
 *                     description: The name of the subcategory in Arabic
 *                     example: "برمجيات"
 *                   nameRUS:
 *                     type: string
 *                     description: The name of the subcategory in Russian
 *                     example: "Программное обеспечение"
 *                   catID:
 *                     type: string
 *                     description: The unique identifier of the associated category
 *                     example: "cat123"
 *       400:
 *         description: Bad request if the category ID is missing
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /monroo/apis/lookups/getAllSubCategories:
 *   post:
 *     summary: Retrieve all subcategories
 *     tags: [lookups]
 *     responses:
 *       200:
 *         description: Successful response with a list of all subcategories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The unique identifier of the subcategory
 *                     example: "subCat123"
 *                   name:
 *                     type: string
 *                     description: The name of the subcategory in English
 *                     example: "Software"
 *                   nameAR:
 *                     type: string
 *                     description: The name of the subcategory in Arabic
 *                     example: "برمجيات"
 *                   nameRUS:
 *                     type: string
 *                     description: The name of the subcategory in Russian
 *                     example: "Программное обеспечение"
 *                   catID:
 *                     type: string
 *                     description: The unique identifier of the associated category
 *                     example: "cat123"
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /monroo/apis/lookups/addEducation:
 *   post:
 *     summary: Add a new education record
 *     tags: [lookups]
 *     requestBody:
 *       description: The education record to be added
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: The unique identifier for the education record (will be auto-generated)
 *                 example: "edu123"
 *               name:
 *                 type: string
 *                 description: The name of the education record
 *                 example: "Bachelor of Science in Computer Science"
 *               nameAR:
 *                 type: string
 *                 description: The name of the education record in Arabic
 *                 example: "بكالوريوس في علوم الكمبيوتر"
 *               nameRUS:
 *                 type: string
 *                 description: The name of the education record in Russian
 *                 example: "Бакалавр наук в области компьютерных наук"
 *     responses:
 *       200:
 *         description: Successful response with the added education record
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The unique identifier for the education record
 *                   example: "edu123"
 *                 name:
 *                   type: string
 *                   description: The name of the education record
 *                   example: "Bachelor of Science in Computer Science"
 *                 nameAR:
 *                   type: string
 *                   description: The name of the education record in Arabic
 *                   example: "بكالوريوس في علوم الكمبيوتر"
 *                 nameRUS:
 *                   type: string
 *                   description: The name of the education record in Russian
 *                   example: "Бакалавр наук в области компьютерных наук"
 *       400:
 *         description: Bad request if the request body is missing or invalid
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /monroo/apis/lookups/addEducations:
 *   post:
 *     summary: Add multiple education records
 *     tags: [lookups]
 *     requestBody:
 *       description: List of education records to be added
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The unique identifier for the education record (will be auto-generated)
 *                   example: "edu123"
 *                 name:
 *                   type: string
 *                   description: The name of the education record
 *                   example: "Bachelor of Science in Computer Science"
 *                 nameAR:
 *                   type: string
 *                   description: The name of the education record in Arabic
 *                   example: "بكالوريوس في علوم الكمبيوتر"
 *                 nameRUS:
 *                   type: string
 *                   description: The name of the education record in Russian
 *                   example: "Бакалавр наук в области компьютерных наук"
 *     responses:
 *       200:
 *         description: Successful response with details of the added education records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 acknowledged:
 *                   type: boolean
 *                   description: Indicates whether the request was acknowledged
 *                   example: true
 *                 insertedIds:
 *                   type: object
 *                   description: Object containing the IDs of the inserted records
 *                   additionalProperties:
 *                     type: string
 *                     description: The unique identifier for each inserted education record
 *                     example: "edu123"
 *                 insertedCount:
 *                   type: integer
 *                   description: Number of records successfully inserted
 *                   example: 3
 *       400:
 *         description: Bad request if the request body is missing or invalid
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /monroo/apis/lookups/getEducations:
 *   post:
 *     summary: Retrieve all education records
 *     tags: [lookups]
 *     responses:
 *       200:
 *         description: Successful response with a list of education records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The unique identifier for the education record
 *                     example: "edu123"
 *                   name:
 *                     type: string
 *                     description: The name of the education record
 *                     example: "Bachelor of Science in Computer Science"
 *                   nameAR:
 *                     type: string
 *                     description: The name of the education record in Arabic
 *                     example: "بكالوريوس في علوم الكمبيوتر"
 *                   nameRUS:
 *                     type: string
 *                     description: The name of the education record in Russian
 *                     example: "Бакалавр наук в области компьютерных наук"
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /monroo/apis/lookups/AddProviderLookup:
 *   post:
 *     summary: Add a new provider lookup record
 *     tags: [lookups]
 *     requestBody:
 *       description: Provider lookup record to be added
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: The unique identifier for the provider lookup record (auto-generated)
 *                 example: "provider123"
 *               catID:
 *                 type: string
 *                 description: Category ID associated with the provider lookup
 *                 example: "cat456"
 *               subCatID:
 *                 type: string
 *                 description: Subcategory ID associated with the provider lookup
 *                 example: "subCat789"
 *               fname:
 *                 type: boolean
 *                 description: Indicates if the first name is to be shown
 *                 example: true
 *               lname:
 *                 type: boolean
 *                 description: Indicates if the last name is to be shown
 *                 example: true
 *               gender:
 *                 type: boolean
 *                 description: Indicates if the gender is to be shown
 *                 example: true
 *               username:
 *                 type: boolean
 *                 description: Indicates if the username is to be shown
 *                 example: true
 *               password:
 *                 type: boolean
 *                 description: Indicates if the password is to be shown
 *                 example: false
 *               registerDate:
 *                 type: boolean
 *                 description: Indicates if the registration date is to be shown
 *                 example: false
 *               phone:
 *                 type: boolean
 *                 description: Indicates if the phone number is to be shown
 *                 example: true
 *               email:
 *                 type: boolean
 *                 description: Indicates if the email is to be shown
 *                 example: true
 *               dob:
 *                 type: boolean
 *                 description: Indicates if the date of birth is to be shown
 *                 example: false
 *               nationality:
 *                 type: boolean
 *                 description: Indicates if the nationality is to be shown
 *                 example: true
 *               education:
 *                 type: boolean
 *                 description: Indicates if the education is to be shown
 *                 example: true
 *               averageRatePerHour:
 *                 type: boolean
 *                 description: Indicates if the average rate per hour is to be shown
 *                 example: false
 *               openToWorkInCountry:
 *                 type: boolean
 *                 description: Indicates if the provider is open to work in the country
 *                 example: true
 *               countryOfResidence:
 *                 type: boolean
 *                 description: Indicates if the country of residence is to be shown
 *                 example: true
 *               spokenLanguage:
 *                 type: boolean
 *                 description: Indicates if spoken language is to be shown
 *                 example: false
 *               experience:
 *                 type: boolean
 *                 description: Indicates if experience is to be shown
 *                 example: true
 *               visaType:
 *                 type: boolean
 *                 description: Indicates if the visa type is to be shown
 *                 example: false
 *               instagram:
 *                 type: boolean
 *                 description: Indicates if Instagram profile is to be shown
 *                 example: false
 *               photos:
 *                 type: boolean
 *                 description: Indicates if photos are to be shown
 *                 example: true
 *               introductionVideoLink:
 *                 type: boolean
 *                 description: Indicates if the introduction video link is to be shown
 *                 example: false
 *               youtubelink:
 *                 type: boolean
 *                 description: Indicates if the YouTube link is to be shown
 *                 example: false
 *               videos:
 *                 type: boolean
 *                 description: Indicates if videos are to be shown
 *                 example: true
 *               bio:
 *                 type: boolean
 *                 description: Indicates if the bio is to be shown (200 words max)
 *                 example: true
 *               workLink:
 *                 type: boolean
 *                 description: Indicates if the work link is to be shown
 *                 example: false
 *               linkedin:
 *                 type: boolean
 *                 description: Indicates if LinkedIn profile is to be shown
 *                 example: true
 *               height:
 *                 type: boolean
 *                 description: Indicates if the height is to be shown
 *                 example: false
 *               weight:
 *                 type: boolean
 *                 description: Indicates if the weight is to be shown
 *                 example: false
 *               resume:
 *                 type: boolean
 *                 description: Indicates if the resume is to be shown
 *                 example: true
 *               portfolio:
 *                 type: boolean
 *                 description: Indicates if the portfolio is to be shown
 *                 example: true
 *               isAmodel:
 *                 type: boolean
 *                 description: Indicates if the provider is a model (for displaying specific types of images)
 *                 example: false
 *               oneMinuteVideo:
 *                 type: boolean
 *                 description: Indicates if a one-minute video is to be shown
 *                 example: true
 *               audios:
 *                 type: boolean
 *                 description: Indicates if audios are to be shown
 *                 example: false
 *               musicalInstruments:
 *                 type: boolean
 *                 description: Indicates if musical instruments are to be shown
 *                 example: false
 *               musicGenres:
 *                 type: boolean
 *                 description: Indicates if music genres are to be shown
 *                 example: true
 *               specialSkills:
 *                 type: boolean
 *                 description: Indicates if special skills are to be shown
 *                 example: true
 *               demoReel:
 *                 type: boolean
 *                 description: Indicates if a demo reel is to be shown
 *                 example: false
 *     responses:
 *       200:
 *         description: Successful response with the added provider lookup record
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The unique identifier for the provider lookup record
 *                   example: "provider123"
 *                 catID:
 *                   type: string
 *                   description: The category ID associated with the provider lookup
 *                   example: "cat456"
 *                 subCatID:
 *                   type: string
 *                   description: The subcategory ID associated with the provider lookup
 *                   example: "subCat789"
 *                 fname:
 *                   type: boolean
 *                   description: Indicates if the first name is to be shown
 *                   example: true
 *                 lname:
 *                   type: boolean
 *                   description: Indicates if the last name is to be shown
 *                   example: true
 *                 gender:
 *                   type: boolean
 *                   description: Indicates if the gender is to be shown
 *                   example: true
 *                 username:
 *                   type: boolean
 *                   description: Indicates if the username is to be shown
 *                   example: true
 *                 password:
 *                   type: boolean
 *                   description: Indicates if the password is to be shown
 *                   example: false
 *                 registerDate:
 *                   type: boolean
 *                   description: Indicates if the registration date is to be shown
 *                   example: false
 *                 phone:
 *                   type: boolean
 *                   description: Indicates if the phone number is to be shown
 *                   example: true
 *                 email:
 *                   type: boolean
 *                   description: Indicates if the email is to be shown
 *                   example: true
 *                 dob:
 *                   type: boolean
 *                   description: Indicates if the date of birth is to be shown
 *                   example: false
 *                 nationality:
 *                   type: boolean
 *                   description: Indicates if the nationality is to be shown
 *                   example: true
 *                 education:
 *                   type: boolean
 *                   description: Indicates if the education is to be shown
 *                   example: true
 *                 averageRatePerHour:
 *                   type: boolean
 *                   description: Indicates if the average rate per hour is to be shown
 *                   example: false
 *                 openToWorkInCountry:
 *                   type: boolean
 *                   description: Indicates if the provider is open to work in the country
 *                   example: true
 *                 countryOfResidence:
 *                   type: boolean
 *                   description: Indicates if the country of residence is to be shown
 *                   example: true
 *                 spokenLanguage:
 *                   type: boolean
 *                   description: Indicates if spoken language is to be shown
 *                   example: false
 *                 experience:
 *                   type: boolean
 *                   description: Indicates if experience is to be shown
 *                   example: true
 *                 visaType:
 *                   type: boolean
 *                   description: Indicates if the visa type is to be shown
 *                   example: false
 *                 instagram:
 *                   type: boolean
 *                   description: Indicates if Instagram profile is to be shown
 *                   example: false
 *                 photos:
 *                   type: boolean
 *                   description: Indicates if photos are to be shown
 *                   example: true
 *                 introductionVideoLink:
 *                   type: boolean
 *                   description: Indicates if the introduction video link is to be shown
 *                   example: false
 *                 youtubelink:
 *                   type: boolean
 *                   description: Indicates if the YouTube link is to be shown
 *                   example: false
 *                 videos:
 *                   type: boolean
 *                   description: Indicates if videos are to be shown
 *                   example: true
 *                 bio:
 *                   type: boolean
 *                   description: Indicates if the bio is to be shown (200 words max)
 *                   example: true
 *                 workLink:
 *                   type: boolean
 *                   description: Indicates if the work link is to be shown
 *                   example: false
 *                 linkedin:
 *                   type: boolean
 *                   description: Indicates if LinkedIn profile is to be shown
 *                   example: true
 *                 height:
 *                   type: boolean
 *                   description: Indicates if the height is to be shown
 *                   example: false
 *                 weight:
 *                   type: boolean
 *                   description: Indicates if the weight is to be shown
 *                   example: false
 *                 resume:
 *                   type: boolean
 *                   description: Indicates if the resume is to be shown
 *                   example: true
 *                 portfolio:
 *                   type: boolean
 *                   description: Indicates if the portfolio is to be shown
 *                   example: true
 *                 isAmodel:
 *                   type: boolean
 *                   description: Indicates if the provider is a model (for displaying specific types of images)
 *                   example: false
 *                 oneMinuteVideo:
 *                   type: boolean
 *                   description: Indicates if a one-minute video is to be shown
 *                   example: true
 *                 audios:
 *                   type: boolean
 *                   description: Indicates if audios are to be shown
 *                   example: false
 *                 musicalInstruments:
 *                   type: boolean
 *                   description: Indicates if musical instruments are to be shown
 *                   example: false
 *                 musicGenres:
 *                   type: boolean
 *                   description: Indicates if music genres are to be shown
 *                   example: true
 *                 specialSkills:
 *                   type: boolean
 *                   description: Indicates if special skills are to be shown
 *                   example: true
 *                 demoReel:
 *                   type: boolean
 *                   description: Indicates if a demo reel is to be shown
 *                   example: false
 *       400:
 *         description: Bad request if the category ID or subcategory ID does not exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Cat ID or Sub Cat ID not exist truefalse"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Cannot Save <error>"
 */
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

/**
 * @swagger
 * /monroo/apis/lookups/AddCollectionProviderLookups:
 *   post:
 *     summary: Add multiple provider lookup records
 *     tags: [lookups]
 *     requestBody:
 *       description: List of provider lookup records to be added
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The unique identifier for the provider lookup record (auto-generated)
 *                   example: "provider123"
 *                 catID:
 *                   type: string
 *                   description: Category ID associated with the provider lookup
 *                   example: "cat456"
 *                 subCatID:
 *                   type: string
 *                   description: Subcategory ID associated with the provider lookup
 *                   example: "subCat789"
 *                 fname:
 *                   type: boolean
 *                   description: Indicates if the first name is to be shown
 *                   example: true
 *                 lname:
 *                   type: boolean
 *                   description: Indicates if the last name is to be shown
 *                   example: true
 *                 gender:
 *                   type: boolean
 *                   description: Indicates if the gender is to be shown
 *                   example: true
 *                 username:
 *                   type: boolean
 *                   description: Indicates if the username is to be shown
 *                   example: true
 *                 password:
 *                   type: boolean
 *                   description: Indicates if the password is to be shown
 *                   example: false
 *                 registerDate:
 *                   type: boolean
 *                   description: Indicates if the registration date is to be shown
 *                   example: false
 *                 phone:
 *                   type: boolean
 *                   description: Indicates if the phone number is to be shown
 *                   example: true
 *                 email:
 *                   type: boolean
 *                   description: Indicates if the email is to be shown
 *                   example: true
 *                 dob:
 *                   type: boolean
 *                   description: Indicates if the date of birth is to be shown
 *                   example: false
 *                 nationality:
 *                   type: boolean
 *                   description: Indicates if the nationality is to be shown
 *                   example: true
 *                 education:
 *                   type: boolean
 *                   description: Indicates if the education is to be shown
 *                   example: true
 *                 averageRatePerHour:
 *                   type: boolean
 *                   description: Indicates if the average rate per hour is to be shown
 *                   example: false
 *                 openToWorkInCountry:
 *                   type: boolean
 *                   description: Indicates if the provider is open to work in the country
 *                   example: true
 *                 countryOfResidence:
 *                   type: boolean
 *                   description: Indicates if the country of residence is to be shown
 *                   example: true
 *                 spokenLanguage:
 *                   type: boolean
 *                   description: Indicates if spoken language is to be shown
 *                   example: false
 *                 experience:
 *                   type: boolean
 *                   description: Indicates if experience is to be shown
 *                   example: true
 *                 visaType:
 *                   type: boolean
 *                   description: Indicates if the visa type is to be shown
 *                   example: false
 *                 instagram:
 *                   type: boolean
 *                   description: Indicates if Instagram profile is to be shown
 *                   example: false
 *                 photos:
 *                   type: boolean
 *                   description: Indicates if photos are to be shown
 *                   example: true
 *                 introductionVideoLink:
 *                   type: boolean
 *                   description: Indicates if the introduction video link is to be shown
 *                   example: false
 *                 youtubelink:
 *                   type: boolean
 *                   description: Indicates if the YouTube link is to be shown
 *                   example: false
 *                 videos:
 *                   type: boolean
 *                   description: Indicates if videos are to be shown
 *                   example: true
 *                 bio:
 *                   type: boolean
 *                   description: Indicates if the bio is to be shown (200 words max)
 *                   example: true
 *                 workLink:
 *                   type: boolean
 *                   description: Indicates if the work link is to be shown
 *                   example: false
 *                 linkedin:
 *                   type: boolean
 *                   description: Indicates if LinkedIn profile is to be shown
 *                   example: true
 *                 height:
 *                   type: boolean
 *                   description: Indicates if the height is to be shown
 *                   example: false
 *                 weight:
 *                   type: boolean
 *                   description: Indicates if the weight is to be shown
 *                   example: false
 *                 resume:
 *                   type: boolean
 *                   description: Indicates if the resume is to be shown
 *                   example: true
 *                 portfolio:
 *                   type: boolean
 *                   description: Indicates if the portfolio is to be shown
 *                   example: true
 *                 isAmodel:
 *                   type: boolean
 *                   description: Indicates if the provider is a model (for displaying specific types of images)
 *                   example: false
 *                 oneMinuteVideo:
 *                   type: boolean
 *                   description: Indicates if a one-minute video is to be shown
 *                   example: true
 *                 audios:
 *                   type: boolean
 *                   description: Indicates if audios are to be shown
 *                   example: false
 *                 musicalInstruments:
 *                   type: boolean
 *                   description: Indicates if musical instruments are to be shown
 *                   example: false
 *                 musicGenres:
 *                   type: boolean
 *                   description: Indicates if music genres are to be shown
 *                   example: true
 *                 specialSkills:
 *                   type: boolean
 *                   description: Indicates if special skills are to be shown
 *                   example: true
 *                 demoReel:
 *                   type: boolean
 *                   description: Indicates if a demo reel is to be shown
 *                   example: false
 *     responses:
 *       200:
 *         description: Successful response with the added provider lookup records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 acknowledged:
 *                   type: boolean
 *                   description: Indicates if the operation was acknowledged
 *                   example: true
 *                 insertedCount:
 *                   type: integer
 *                   description: Number of records inserted
 *                   example: 5
 *                 insertedIds:
 *                   type: object
 *                   additionalProperties:
 *                     type: string
 *                   description: Object mapping the IDs of inserted records
 *       400:
 *         description: Bad request if the body is empty or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Empty body"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Cannot Save <error>"
 */
router.route('/AddCollectionProviderLookups').post(myAuth, async function(req, res) {
    try {
        var bodyList = req.body;
        if (bodyList) {
            bodyList.forEach(element => {
                element.id = uuidv4();
            });
        } else {
            throw new Error("Empty body");
        }
        var response = await ProviderLook.collection.insertMany(bodyList);
        returnData(res, response);
    } catch (ex) {
        returnError(res, ex.message);
    }
});


/**
 * @swagger
 * /monroo/apis/lookups/UpdateCategoyInProvide:
 *   post:
 *     summary: Update the category ID for a specific provider lookup record
 *     tags: [lookups]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       description: The category ID and subcategory ID to update the provider lookup record
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               catID:
 *                 type: string
 *                 description: The new category ID to set for the provider lookup
 *                 example: "newCat123"
 *               subCatID:
 *                 type: string
 *                 description: The subcategory ID of the provider lookup record to be updated
 *                 example: "subCat456"
 *     responses:
 *       200:
 *         description: Successful response with the updated provider lookup record
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The unique identifier of the provider lookup record
 *                   example: "provider789"
 *                 catID:
 *                   type: string
 *                   description: The updated category ID
 *                   example: "newCat123"
 *                 subCatID:
 *                   type: string
 *                   description: The subcategory ID of the provider lookup record
 *                   example: "subCat456"
 *                 # Include other properties as needed
 *       400:
 *         description: Bad request if `catID` or `subCatID` is missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "cat id or sub cat id not sent"
 *       404:
 *         description: Not found if the provider lookup record with the given `subCatID` does not exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "item not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Error message details"
 */
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

/**
 * @swagger
 * /monroo/apis/lookups/GetProviderLookups:
 *   post:
 *     summary: Retrieve a provider lookup record by category ID and subcategory ID
 *     tags: [lookups]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       description: The category ID and subcategory ID to retrieve the provider lookup record
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               catID:
 *                 type: string
 *                 description: The category ID to filter the provider lookup record
 *                 example: "category123"
 *               subCatID:
 *                 type: string
 *                 description: The subcategory ID to filter the provider lookup record
 *                 example: "subcategory456"
 *     responses:
 *       200:
 *         description: Successful response with the provider lookup record
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The unique identifier of the provider lookup record
 *                   example: "provider789"
 *                 catID:
 *                   type: string
 *                   description: The category ID associated with the provider lookup
 *                   example: "category123"
 *                 subCatID:
 *                   type: string
 *                   description: The subcategory ID associated with the provider lookup
 *                   example: "subcategory456"
 *       400:
 *         description: Bad request if `catID` or `subCatID` is missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "cat id or sub cat id not sent"
 *       404:
 *         description: Not found if no provider lookup record matches the given `catID` and `subCatID`
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "item not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Error message details"
 */
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

/**
 * @swagger
 * /monroo/apis/lookups/GetAllProviderLookups:
 *   post:
 *     summary: Retrieve all provider lookup records
 *     tags: [lookups]
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Successful response with a list of all provider lookup records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The unique identifier of the provider lookup record
 *                     example: "provider789"
 *                   catID:
 *                     type: string
 *                     description: The category ID associated with the provider lookup
 *                     example: "category123"
 *                   subCatID:
 *                     type: string
 *                     description: The subcategory ID associated with the provider lookup
 *                     example: "subcategory456"
 *                   fname:
 *                     type: boolean
 *                     description: Whether the first name is required
 *                     example: true
 *                   lname:
 *                     type: boolean
 *                     description: Whether the last name is required
 *                     example: false
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Error message details"
 */
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
