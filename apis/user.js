var express = require("express");
var router = express.Router();
var User = require("../models/users.model");
var Provider = require("../models/provider.model");
var Event = require("../models/event.model");
var Message = require("../models/message.model");
var Reviews = require("../models/reviews.model");
let jwt = require("jsonwebtoken");
let auth = require("../middleware/auth");
let myAuth = require("../middleware/myAuth");
let bcrypt = require("bcryptjs");
const crypto = require("crypto");
var Permission = require("../models/permission.model");
let uploadAll = require("../middleware/uploadAll");

const admin = require("../bin/fbinit");

/**
 * @swagger
 * tags:
 *   name: User
 *   description: Operations related to user
 */

/**
 * @swagger
 * /monroo/apis/user/getAllEvents:
 *   post:
 *     summary: Retrieve a list of all events
 *     description: Fetches all events from the database. Requires authentication.
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Successfully retrieved list of all events
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Unique identifier of the event
 *                     example: "605c72ef1b4e8e3f4e4d8c0a"
 *                   title:
 *                     type: string
 *                     description: Title of the event
 *                     example: "Annual Charity Gala"
 *                   desc:
 *                     type: string
 *                     description: Description of the event
 *                     example: "A gala to raise funds for local charities."
 *                   createdDate:
 *                     type: string
 *                     format: date-time
 *                     description: Date when the event was created
 *                     example: "2024-01-01T12:00:00Z"
 *                   eventDate:
 *                     type: string
 *                     format: date-time
 *                     description: Date when the event starts
 *                     example: "2024-08-30T18:00:00Z"
 *                   eventEndDate:
 *                     type: string
 *                     format: date-time
 *                     description: Date when the event ends
 *                     example: "2024-08-30T23:59:00Z"
 *                   userID:
 *                     type: string
 *                     description: ID of the user who created the event
 *                     example: "605c72ef1b4e8e3f4e4d8c0b"
 *                   providerID:
 *                     type: string
 *                     description: ID of the provider associated with the event
 *                     example: "605c72ef1b4e8e3f4e4d8c0c"
 *                   catID:
 *                     type: string
 *                     description: Category ID of the event
 *                     example: "605c72ef1b4e8e3f4e4d8c0d"
 *                   subCatID:
 *                     type: string
 *                     description: Sub-category ID of the event
 *                     example: "605c72ef1b4e8e3f4e4d8c0e"
 *                   location:
 *                     type: string
 *                     description: Location where the event is held
 *                     example: "New York City, NY"
 *                   languages:
 *                     type: string
 *                     description: Languages spoken at the event
 *                     example: "English, Spanish"
 *                   gender:
 *                     type: integer
 *                     description: Gender preference for the event
 *                     enum: [0, 1, 2]
 *                     example: 1
 *                   duration:
 *                     type: string
 *                     description: Duration of the event
 *                     example: "3 hours"
 *                   averageCost:
 *                     type: string
 *                     description: Average cost for attending the event
 *                     example: "$50"
 *                   country:
 *                     type: string
 *                     description: Country where the event is held
 *                     example: "USA"
 *                   dealCost:
 *                     type: string
 *                     description: Cost of any deal associated with the event
 *                     example: "$100"
 *                   status:
 *                     type: integer
 *                     description: Current status of the event
 *                     enum: [0, 1, 2, 3, 4, 5]
 *                     example: 0
 *       401:
 *         description: Unauthorized access, invalid authentication token
 *       500:
 *         description: Internal server error
 */
router.route("/getAllEvents").post(myAuth, async function (req, res) {
  Event.find(function (err, item) {
    if (item) {
      returnData(res, item);
    } else if (err) {
      returnError(res, err);
    }
  });
});

/**
 * @swagger
 * /monroo/apis/user/getAllUsers:
 *   post:
 *     summary: Retrieve a list of all users
 *     description: Fetches all users from the database. Requires authentication.
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Successfully retrieved list of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Unique identifier of the user
 *                     example: "605c72ef1b4e8e3f4e4d8c0a"
 *                   name:
 *                     type: string
 *                     description: Name of the user
 *                     example: "John Doe"
 *                   profilePic:
 *                     type: string
 *                     description: URL of the user's profile picture
 *                     example: "https://example.com/uploads/profilePic/johndoe.jpg"
 *                   country:
 *                     type: string
 *                     description: Country of the user
 *                     example: "UAE"
 *                   isActive:
 *                     type: boolean
 *                     description: Indicates if the user's account is active
 *                     example: true
 *                   username:
 *                     type: string
 *                     description: Username of the user
 *                     example: "johndoe"
 *                   password:
 *                     type: string
 *                     description: Password of the user (usually not returned in responses)
 *                     example: "********"
 *                   registerDate:
 *                     type: string
 *                     format: date-time
 *                     description: Date when the user registered
 *                     example: "2024-01-01T12:00:00Z"
 *                   phone:
 *                     type: string
 *                     description: Phone number of the user
 *                     example: "+971555555555"
 *                   email:
 *                     type: string
 *                     description: Email address of the user
 *                     example: "johndoe@example.com"
 *                   about:
 *                     type: string
 *                     description: Brief description about the user
 *                     example: "Software developer with 5 years of experience."
 *                   companyName:
 *                     type: string
 *                     description: Name of the company the user is associated with
 *                     example: "Tech Solutions Ltd."
 *                   intrestedList:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: List of category IDs the user is interested in
 *                     example: ["605c72ef1b4e8e3f4e4d8c0b", "605c72ef1b4e8e3f4e4d8c0c"]
 *                   token:
 *                     type: string
 *                     description: Authentication token for the user (usually not returned in responses)
 *                     example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                   fcmToken:
 *                     type: string
 *                     description: Firebase Cloud Messaging token for notifications
 *                     example: "fcmTokenExample123456"
 *       401:
 *         description: Unauthorized access, invalid authentication token
 *       500:
 *         description: Internal server error
 */
router.route("/getAllUsers").post(myAuth, async function (req, res) {
  User.find(function (err, item) {
    if (item) {
      returnData(res, item);
    } else if (err) {
      returnError(res, err);
    }
  });
});

/**
 * @swagger
 * /monroo/apis/user/getUserById:
 *   post:
 *     summary: Retrieve user details by user ID
 *     description: Fetches details of a user based on their user ID. Requires authentication.
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userID:
 *                 type: string
 *                 description: The ID of the user to retrieve
 *                 example: "605c72ef1b4e8e3f4e4d8c0a"
 *     responses:
 *       200:
 *         description: Successfully retrieved user details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Unique identifier of the user
 *                   example: "605c72ef1b4e8e3f4e4d8c0a"
 *                 name:
 *                   type: string
 *                   description: Name of the user
 *                   example: "John Doe"
 *                 profilePic:
 *                   type: string
 *                   description: URL of the user's profile picture
 *                   example: "https://example.com/uploads/profilePic/johndoe.jpg"
 *                 country:
 *                   type: string
 *                   description: Country of the user
 *                   example: "UAE"
 *                 isActive:
 *                   type: boolean
 *                   description: Indicates if the user's account is active
 *                   example: true
 *                 username:
 *                   type: string
 *                   description: Username of the user
 *                   example: "johndoe"
 *                 password:
 *                   type: string
 *                   description: Password of the user (usually not returned in responses)
 *                   example: "********"
 *                 registerDate:
 *                   type: string
 *                   format: date-time
 *                   description: Date when the user registered
 *                   example: "2024-01-01T12:00:00Z"
 *                 phone:
 *                   type: string
 *                   description: Phone number of the user
 *                   example: "+971555555555"
 *                 email:
 *                   type: string
 *                   description: Email address of the user
 *                   example: "johndoe@example.com"
 *                 about:
 *                   type: string
 *                   description: Brief description about the user
 *                   example: "Software developer with 5 years of experience."
 *                 companyName:
 *                   type: string
 *                   description: Name of the company the user is associated with
 *                   example: "Tech Solutions Ltd."
 *                 intrestedList:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of category IDs the user is interested in
 *                   example: ["605c72ef1b4e8e3f4e4d8c0b", "605c72ef1b4e8e3f4e4d8c0c"]
 *                 token:
 *                   type: string
 *                   description: Authentication token for the user (usually not returned in responses)
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 fcmToken:
 *                   type: string
 *                   description: Firebase Cloud Messaging token for notifications
 *                   example: "fcmTokenExample123456"
 *       400:
 *         description: Bad request, user ID not provided or invalid
 *       401:
 *         description: Unauthorized access, invalid authentication token
 *       500:
 *         description: Internal server error
 */
router.route("/getUserById").post(myAuth, async function (req, res) {
  const { userID } = req.body;
  console.log("USER", userID);
  if (!userID) {
    return returnError(res, "User not found");
  }
  User.findOne({ id: userID }, function (err, item) {
    if (item) {
      returnData(res, item);
    } else if (err) {
      returnError(res, err);
    }
  });
});

/**
 * @swagger
 * /monroo/apis/user/fcmToken:
 *   post:
 *     summary: Update the Firebase Cloud Messaging (FCM) token for a user
 *     description: Updates the FCM token for the authenticated user, allowing for notifications to be sent to their device. Requires authentication.
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fcmToken:
 *                 type: string
 *                 description: The new Firebase Cloud Messaging token for the user
 *                 example: "fcmTokenExample123456"
 *     responses:
 *       200:
 *         description: Successfully updated the FCM token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Unique identifier of the user
 *                   example: "605c72ef1b4e8e3f4e4d8c0a"
 *                 fcmToken:
 *                   type: string
 *                   description: The updated FCM token
 *                   example: "fcmTokenExample123456"
 *       400:
 *         description: Bad request, FCM token not provided
 *       401:
 *         description: Unauthorized access, invalid authentication token
 *       500:
 *         description: Internal server error
 */
router.route("/fcmToken").post(auth, async function (req, res) {
  let userID = req.user.userID;
  let fcmToken = req.body.fcmToken;
  if (fcmToken) {
    let user = await User.findOne({ id: userID });
    user.fcmToken = fcmToken;
    await user.save();
    console.log(user);

    returnData(res, user);
  } else {
    console.log("Fcm Token not found");

    returnError(res, "Fcm Token not found");
  }
});

/**
 * @swagger
 * /monroo/apis/user/removeUser:
 *   post:
 *     summary: Remove a user by their ID
 *     description: Deletes a user from the database using their unique user ID. Requires authentication.
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userID:
 *                 type: string
 *                 description: The ID of the user to be removed
 *                 example: "605c72ef1b4e8e3f4e4d8c0a"
 *     responses:
 *       200:
 *         description: Successfully removed the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: object
 *                   description: Result of the delete operation
 *       400:
 *         description: Bad request, invalid or missing userID
 *       401:
 *         description: Unauthorized access, invalid authentication token
 *       500:
 *         description: Internal server error
 */
router.route("/removeUser").post(myAuth, async function (req, res) {
  User.deleteMany({ id: req.body.userID }, function (err, item) {
    if (err) {
      res.status(202).send({ error: err });
    } else {
      res.status(200).send({ message: item });
    }
  });
});

/**
 * @swagger
 * /monroo/apis/user/checkAuth:
 *   post:
 *     summary: Verify and refresh authentication token
 *     description: Verifies the provided JWT token. If the token is expired, a new token is issued and the user's record is updated. If the token is valid, the user's details are returned.
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: The JWT token to be verified
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiI2MDVjNzJlZjFiNGU4ZTNmNGU0ZDhjMGYiLCJleHBpcmF0aW9uIjoxNjk5MjEyMzM2fQ.S5N9W3eR6k93yXvKmgJj4lFvFplkeuKPVr7lWbA4Iuc"
 *     responses:
 *       200:
 *         description: Successfully verified the token and returned the user details. If the token was expired, a new token is issued and returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: User ID
 *                   example: "605c72ef1b4e8e3f4e4d8c0a"
 *                 email:
 *                   type: string
 *                   description: User email
 *                   example: "user@example.com"
 *                 country:
 *                   type: string
 *                   description: User's country
 *                   example: "UAE"
 *                 token:
 *                   type: string
 *                   description: New JWT token if the old one was expired
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiI2MDVjNzJlZjFiNGU4ZTNmNGU0ZDhjMGYiLCJleHBpcmF0aW9uIjoxNjk5MjEyMzM2fQ.S5N9W3eR6k93yXvKmgJj4lFvFplkeuKPVr7lWbA4Iuc"
 *       400:
 *         description: Bad request, token not provided or invalid
 *       401:
 *         description: Unauthorized access, invalid or expired authentication token
 *       500:
 *         description: Internal server error
 */
router.route("/checkAuth").post(async function (req, res) {
  const config = process.env;
  var tokenMe = req.headers["x-access-token"];
  if (!tokenMe) {
    return returnError(res, "Token not sent");
  } else {
    try {
      const decoded = jwt.verify(tokenMe, config.JWT_KEY);
      req.user = decoded;
      let userID = req.user.userID;
      var user = await User.findOne({ id: userID });
      if (!user) {
        return returnError(res, "User Not Found");
      }
      return returnData(res, user);
    } catch (err) {
      try {
        if (err.name === "TokenExpiredError") {
          const payload = jwt.verify(tokenMe, config.JWT_KEY, {
            ignoreExpiration: true,
          });
          var userID = payload.userID;
          var user = await User.findOne({ id: userID });
          var email = user.email;
          var country = user.country;
          let token = jwt.sign(
            { userID: userID, email: email, country: country },
            process.env.JWT_KEY,
            {
              expiresIn: "24h",
            }
          );
          user.token = token;
          await user.save();
          return returnData(res, user);
        } else {
          console.log("err not expired but other exception :" + err);
          return returnError(res, "Token is not valid ." + err);
        }
      } catch (err) {
        console.log(err);
        return returnError(res, "Token is not valid " + err.message);
      }
    }
  }
});

/**
 * @swagger
 * /monroo/apis/user/loginSocial:
 *   post:
 *     summary: Login using social credentials
 *     description: Authenticates a user based on their social credentials (username or email) and a predefined password. Updates the user's FCM token if provided and returns user details along with a new JWT token.
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username or email of the user attempting to log in.
 *                 example: "user@example.com"
 *               fcmToken:
 *                 type: string
 *                 description: FCM token for push notifications (optional).
 *                 example: "fcm_token_example"
 *     responses:
 *       200:
 *         description: Successfully logged in user. Returns user details and a new JWT token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: User ID.
 *                   example: "605c72ef1b4e8e3f4e4d8c0a"
 *                 name:
 *                   type: string
 *                   description: User's name.
 *                   example: "John Doe"
 *                 profilePic:
 *                   type: string
 *                   description: URL of the user's profile picture.
 *                   example: "https://example.com/profile-pic.jpg"
 *                 country:
 *                   type: string
 *                   description: User's country.
 *                   example: "UAE"
 *                 isActive:
 *                   type: boolean
 *                   description: Indicates if the user is active.
 *                   example: true
 *                 username:
 *                   type: string
 *                   description: Username of the user.
 *                   example: "johndoe"
 *                 email:
 *                   type: string
 *                   description: User's email.
 *                   example: "user@example.com"
 *                 token:
 *                   type: string
 *                   description: JWT token for authenticated sessions.
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiI2MDVjNzJlZjFiNGU4ZTNmNGU0ZDhjMGYiLCJleHBpcmF0aW9uIjoxNjk5MjEyMzM2fQ.S5N9W3eR6k93yXvKmgJj4lFvFplkeuKPVr7lWbA4Iuc"
 *                 fcmToken:
 *                   type: string
 *                   description: Updated FCM token for push notifications.
 *                   example: "fcm_token_example"
 *       400:
 *         description: Bad request, username not provided or invalid.
 *       401:
 *         description: Unauthorized, incorrect password or user not found.
 *       500:
 *         description: Internal server error.
 */
router.route("/loginSocial").post(myAuth, function (req, res) {
  const { username, fcmToken } = req.body;
  if (username) {
    User.findOne(
      { $or: [{ username: username }, { email: username }] },
      function (err, item) {
        if (item && item.password) {
          let password = process.env.SOCIALPASS;
          if (!bcrypt.compareSync(password, item.password)) {
            return returnError(res, "Wrong password");
          }
          let token = getToken(item.id, item.email, item.country);
          item.token = token;
          if (fcmToken) item.fcmToken = fcmToken;
          item.status = 200;
          item.save(function (err) {
            if (err) {
              console.log("modelError:", err);
              return returnError(res, "Cannot login " + err);
            } else {
              item.password = "*******";
              return returnData(res, item);
            }
          });
        } else {
          return returnError(res, "Cannot find user");
        }
      }
    );
  } else {
    return returnError(res, "Username not detected");
  }
});

/**
 * @swagger
 * /monroo/apis/user/login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user with a username or email and password. Updates the user's FCM token if provided and returns user details along with a new JWT token.
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username or email of the user attempting to log in.
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 description: Password of the user.
 *                 example: "userpassword"
 *               fcmToken:
 *                 type: string
 *                 description: FCM token for push notifications (optional).
 *                 example: "fcm_token_example"
 *     responses:
 *       200:
 *         description: Successfully logged in user. Returns user details and a new JWT token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: User ID.
 *                   example: "605c72ef1b4e8e3f4e4d8c0a"
 *                 name:
 *                   type: string
 *                   description: User's name.
 *                   example: "John Doe"
 *                 profilePic:
 *                   type: string
 *                   description: URL of the user's profile picture.
 *                   example: "https://example.com/profile-pic.jpg"
 *                 country:
 *                   type: string
 *                   description: User's country.
 *                   example: "UAE"
 *                 isActive:
 *                   type: boolean
 *                   description: Indicates if the user is active.
 *                   example: true
 *                 username:
 *                   type: string
 *                   description: Username of the user.
 *                   example: "johndoe"
 *                 email:
 *                   type: string
 *                   description: User's email.
 *                   example: "user@example.com"
 *                 token:
 *                   type: string
 *                   description: JWT token for authenticated sessions.
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiI2MDVjNzJlZjFiNGU4ZTNmNGU0ZDhjMGYiLCJleHBpcmF0aW9uIjoxNjk5MjEyMzM2fQ.S5N9W3eR6k93yXvKmgJj4lFvFplkeuKPVr7lWbA4Iuc"
 *                 fcmToken:
 *                   type: string
 *                   description: Updated FCM token for push notifications.
 *                   example: "fcm_token_example"
 *       400:
 *         description: Bad request, username or password not provided.
 *       401:
 *         description: Unauthorized, incorrect password or user not found.
 *       500:
 *         description: Internal server error.
 */
router.route("/login").post(myAuth, function (req, res) {
  const { username, fcmToken } = req.body;

  if (username) {
    User.findOne(
      { $or: [{ username: username }, { email: username }] },
      function (err, item) {
        if (item && item.password) {
          let password = req.body.password;
          if (!bcrypt.compareSync(password, item.password)) {
            return returnError(res, "Wrong password");
          }
          let token = getToken(item.id, item.email, item.country);
          item.token = token;
          item.fcmToken = fcmToken;
          item.status = 200;
          item.save(function (err) {
            if (err) {
              console.log("modelError:", err);
              return returnError(res, "Cannot login " + err);
            } else {
              item.password = "*******";
              return returnData(res, item);
            }
          });
        } else {
          return returnError(res, "Cannot find user");
        }
      }
    );
  } else {
    return returnError(res, "Username not detected");
  }
});

/**
 * @swagger
 * /monroo/apis/user/SocialRegister:
 *   post:
 *     summary: Register a new user with social authentication
 *     description: Registers a user using social authentication. Handles profile picture uploads and generates a token for the new user.
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: string
 *                 description: JSON string containing user details.
 *                 example: '{"userName": "john_doe", "email": "john@example.com", "phone": "1234567890", "country": "UAE"}'
 *               profilePic:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                   description: Profile picture of the user.
 *     responses:
 *       200:
 *         description: Successfully registered user. Returns user details with a generated token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: User ID.
 *                   example: "605c72ef1b4e8e3f4e4d8c0a"
 *                 name:
 *                   type: string
 *                   description: User's name.
 *                   example: "John Doe"
 *                 profilePic:
 *                   type: string
 *                   description: URL of the user's profile picture.
 *                   example: "https://example.com/uploads/profilePic/profilePic.jpg"
 *                 country:
 *                   type: string
 *                   description: User's country.
 *                   example: "UAE"
 *                 isActive:
 *                   type: boolean
 *                   description: Indicates if the user is active.
 *                   example: false
 *                 username:
 *                   type: string
 *                   description: Username of the user.
 *                   example: "johndoe"
 *                 email:
 *                   type: string
 *                   description: User's email.
 *                   example: "user@example.com"
 *                 token:
 *                   type: string
 *                   description: JWT token for authenticated sessions.
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiI2MDVjNzJlZjFiNGU4ZTNmNGU0ZDhjMGYiLCJleHBpcmF0aW9uIjoxNjk5MjEyMzM2fQ.S5N9W3eR6k93yXvKmgJj4lFvFplkeuKPVr7lWbA4Iuc"
 *       400:
 *         description: Bad request, missing or incorrect user details.
 *       401:
 *         description: Unauthorized, unable to process registration.
 *       500:
 *         description: Internal server error, issue during registration.
 */
router.post(
  "/SocialRegister",
  [uploadAll, myAuth],
  async function (req, res, next) {
    try {
      const DOMAIN = process.env.DOMAIN_ME;
      const body = User(JSON.parse(req.body.data));
      const { profilePic } = req.files;
      if (profilePic) {
        for (const item of profilePic) {
          body.profilePic = DOMAIN + "uploads/profilePic/" + item.filename;
        }
      }

      const userID = crypto.randomUUID();
      body.id = userID;
      if (!body) return returnError(res, "Info not detected");

      const { userName: username, email, phone } = body;
      let oldUser = await User.findOne({
        $or: [{ id: body.id }, { email: email }, { phone: phone }],
      });
      if (oldUser)
        return returnError(
          res,
          "This user already registered, duplicate email or mobile number"
        );

      body.password = process.env.SOCIALPASS;
      let encryptedPassword = await bcrypt.hash(body.password, 10);
      body.password = encryptedPassword;
      let token = getToken(userID, body.email, body.country);
      body.token = token;
      console.log({ body });
      body.save(function (err) {
        if (err) {
          return returnError(res, "Cannot Register " + err);
        } else {
          body.password = "*******";
          return returnData(res, body);
        }
      });
    } catch (error) {
      return returnError(res, "Error " + error);
    }
  }
);

/**
 * @swagger
 * /monroo/apis/user/Register:
 *   post:
 *     summary: Register a new user with optional profile picture upload
 *     description: Registers a new user and optionally handles the upload of a profile picture. Returns user details and a generated token.
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: string
 *                 description: JSON string containing user details.
 *                 example: '{"userName": "john_doe", "email": "john@example.com", "phone": "1234567890", "country": "UAE", "password": "your_password"}'
 *               profilePic:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                   description: Optional profile picture of the user.
 *     responses:
 *       200:
 *         description: Successfully registered user. Returns user details with a generated token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: User ID.
 *                   example: "605c72ef1b4e8e3f4e4d8c0a"
 *                 userName:
 *                   type: string
 *                   description: User's username.
 *                   example: "john_doe"
 *                 email:
 *                   type: string
 *                   description: User's email.
 *                   example: "john@example.com"
 *                 phone:
 *                   type: string
 *                   description: User's phone number.
 *                   example: "1234567890"
 *                 country:
 *                   type: string
 *                   description: User's country.
 *                   example: "UAE"
 *                 profilePic:
 *                   type: string
 *                   description: URL of the user's profile picture.
 *                   example: "https://example.com/uploads/profilePic/profilePic.jpg"
 *                 token:
 *                   type: string
 *                   description: JWT token for authenticated sessions.
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiI2MDVjNzJlZjFiNGU4ZTNmNGU0ZDhjMGYiLCJleHBpcmF0aW9uIjoxNjk5MjEyMzM2fQ.S5N9W3eR6k93yXvKmgJj4lFvFplkeuKPVr7lWbA4Iuc"
 *       400:
 *         description: Bad request, missing or incorrect user details.
 *       401:
 *         description: Unauthorized, unable to process registration.
 *       500:
 *         description: Internal server error, issue during registration.
 */
router.post("/Register", [uploadAll, myAuth], async function (req, res, next) {
  try {
    const DOMAIN = process.env.DOMAIN_ME;
    const body = User(JSON.parse(req.body.data));
    console.log({ body });
    const { profilePic } = req.files;
    if (profilePic) {
      for (const item of profilePic) {
        body.profilePic = DOMAIN + "uploads/profilePic/" + item.filename;
      }
    } else {
      body.profilePic = "";
    }
    const userID = crypto.randomUUID();
    body.id = userID;
    if (!body) return returnError(res, "Info not detected");

    const { userName: username, email, phone } = body;
    let oldUser = await User.findOne({
      $or: [{ id: body.id }, { email: email }, { phone: phone }],
    });
    console.log(oldUser);
    if (oldUser)
      return returnError(
        res,
        "This user already registered, duplicate email or mobile number"
      );

    let encryptedPassword = await bcrypt.hash(body.password, 10);
    body.password = encryptedPassword;
    let token = getToken(userID, body.email, body.country);
    body.token = token;
    body.save(function (err) {
      if (err) {
        return returnError(res, "Cannot Register " + err);
      } else {
        body.password = "*******";
        return returnData(res, body);
      }
    });
  } catch (error) {
    return returnError(res, "Error " + error);
  }
});

/**
 * @swagger
 * /monroo/apis/user/UpdateUser:
 *   post:
 *     summary: Update user information with optional profile picture upload
 *     description: Updates user details and optionally handles the upload of a new profile picture. Returns the updated user details and a new token.
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: string
 *                 description: JSON string containing user details to update.
 *                 example: '{"id": "605c72ef1b4e8e3f4e4d8c0a", "userName": "john_doe_updated", "email": "john_updated@example.com", "phone": "0987654321", "country": "UAE"}'
 *               profilePic:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                   description: Optional new profile picture of the user.
 *     responses:
 *       200:
 *         description: Successfully updated user information. Returns the updated user details and a new token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: User ID.
 *                   example: "605c72ef1b4e8e3f4e4d8c0a"
 *                 userName:
 *                   type: string
 *                   description: User's username.
 *                   example: "john_doe_updated"
 *                 email:
 *                   type: string
 *                   description: User's email.
 *                   example: "john_updated@example.com"
 *                 phone:
 *                   type: string
 *                   description: User's phone number.
 *                   example: "0987654321"
 *                 country:
 *                   type: string
 *                   description: User's country.
 *                   example: "UAE"
 *                 profilePic:
 *                   type: string
 *                   description: URL of the updated profile picture.
 *                   example: "https://example.com/uploads/profilePic/profilePic_updated.jpg"
 *                 token:
 *                   type: string
 *                   description: JWT token for authenticated sessions.
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiI2MDVjNzJlZjFiNGU4ZTNmNGU0ZDhjMGYiLCJleHBpcmF0aW9uIjoxNjk5MjEyMzM2fQ.S5N9W3eR6k93yXvKmgJj4lFvFplkeuKPVr7lWbA4Iuc"
 *       400:
 *         description: Bad request, missing or incorrect user details.
 *       401:
 *         description: Unauthorized, unable to process update.
 *       500:
 *         description: Internal server error, issue during update.
 */
router.post(
  "/UpdateUser",
  [uploadAll, myAuth],
  async function (req, res, next) {
    try {
      const DOMAIN = process.env.DOMAIN_ME;
      const body = User(JSON.parse(req.body.data));
      const { profilePic } = req.files;
      if (profilePic) {
        for (const item of profilePic) {
          body.profilePic = DOMAIN + "uploads/profilePic/" + item.filename;
        }
      }
      if (!body) return returnError(res, "Info not detected");
      const { id, email, phone } = body;
      let oldUser = await User.findOne({
        $or: [{ id: body.id }, { email: email }, { phone: phone }],
      });
      console.log(oldUser);
      if (oldUser) {
        // let password = body.password;
        // if (!bcrypt.compareSync(password, oldUser.password)){
        //     return returnError(res , "Wrong password");
        // }
        body.password = oldUser.password;
        let token = getToken(id, body.email, body.country);
        body.token = token;
        body._id = oldUser._id;
        body._v = oldUser._v;
        const doc = await User.findOneAndUpdate(
          { $or: [{ id: id }, { email: email }] },
          body,
          {
            new: true,
          }
        );
        if (doc) {
          doc.password = "******";
          return returnData(res, doc);
        } else {
          return returnError(res, "Error occured");
        }
        // body.save(function (err) {
        //     if (err) {
        //         return returnError(res, "Cannot Register " + err);
        //     } else {
        //         body.password = "*******"
        //         return returnData(res, body);
        //     }
        // });
      } else return returnError(res, "Cannot find user info");
    } catch (error) {
      return returnError(res, "Error " + error);
    }
  }
);

/**
 * @swagger
 * /monroo/apis/user/CreateEvent:
 *   post:
 *     summary: Create a new event
 *     description: Creates a new event with the provided details. The request must include user authentication. The event is assigned a unique ID and associated with the user making the request.
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the event.
 *                 example: "Annual Conference"
 *               desc:
 *                 type: string
 *                 description: Description of the event.
 *                 example: "A yearly conference to discuss the latest in technology."
 *               createdDate:
 *                 type: string
 *                 format: date
 *                 description: The date the event was created.
 *                 example: "2024-08-24"
 *               eventDate:
 *                 type: string
 *                 format: date
 *                 description: The date of the event.
 *                 example: "2024-09-15"
 *               eventEndDate:
 *                 type: string
 *                 format: date
 *                 description: The end date of the event.
 *                 example: "2024-09-16"
 *               location:
 *                 type: string
 *                 description: Location where the event will take place.
 *                 example: "Dubai International Convention Center"
 *               languages:
 *                 type: string
 *                 description: Languages in which the event will be conducted.
 *                 example: "English, Arabic"
 *               gender:
 *                 type: integer
 *                 description: Gender preference for the event.
 *                 example: 1
 *               duration:
 *                 type: string
 *                 description: Duration of the event.
 *                 example: "2 days"
 *               averageCost:
 *                 type: string
 *                 description: Average cost to attend the event.
 *                 example: "$200"
 *               dealCost:
 *                 type: string
 *                 description: Special deal cost for the event.
 *                 example: "$150"
 *               status:
 *                 type: integer
 *                 description: Current status of the event.
 *                 example: 0
 *     responses:
 *       200:
 *         description: Successfully created event. Returns the event details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Unique ID of the event.
 *                   example: "e4a0d77e-1f82-44f3-9c4a-9d8d92f7b2e0"
 *                 title:
 *                   type: string
 *                   description: Title of the event.
 *                   example: "Annual Conference"
 *                 desc:
 *                   type: string
 *                   description: Description of the event.
 *                   example: "A yearly conference to discuss the latest in technology."
 *                 createdDate:
 *                   type: string
 *                   description: The date the event was created.
 *                   example: "2024-08-24"
 *                 eventDate:
 *                   type: string
 *                   description: The date of the event.
 *                   example: "2024-09-15"
 *                 eventEndDate:
 *                   type: string
 *                   description: The end date of the event.
 *                   example: "2024-09-16"
 *                 location:
 *                   type: string
 *                   description: Location where the event will take place.
 *                   example: "Dubai International Convention Center"
 *                 languages:
 *                   type: string
 *                   description: Languages in which the event will be conducted.
 *                   example: "English, Arabic"
 *                 gender:
 *                   type: integer
 *                   description: Gender preference for the event.
 *                   example: 1
 *                 duration:
 *                   type: string
 *                   description: Duration of the event.
 *                   example: "2 days"
 *                 averageCost:
 *                   type: string
 *                   description: Average cost to attend the event.
 *                   example: "$200"
 *                 dealCost:
 *                   type: string
 *                   description: Special deal cost for the event.
 *                   example: "$150"
 *                 status:
 *                   type: integer
 *                   description: Current status of the event.
 *                   example: 0
 *       400:
 *         description: Bad request, data not provided or incorrect format.
 *       401:
 *         description: Unauthorized, invalid or missing authentication token.
 *       500:
 *         description: Internal server error, issue with event creation.
 */
router.post("/CreateEvent", auth, async function (req, res) {
  try {
    const event = Event(req.body);
    event.userID = req.user.userID;
    event.country = req.user.country;
    if (event) {
      event.id = crypto.randomUUID();
      event.save(function (err) {
        if (err) {
          return returnError(res, "Failed" + err);
        } else {
          return returnData(res, event);
        }
      });
    } else {
      return returnError(res, "Data Not Correct");
    }
  } catch (err) {
    return returnError(res, "Data Not Correct");
  }
});

/**
 * @swagger
 * /monroo/apis/user/removeEvent:
 *   post:
 *     summary: Remove an event
 *     description: Deletes an event based on the provided ID. The request must include user authentication.
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: ID of the event to be removed.
 *                 example: "e4a0d77e-1f82-44f3-9c4a-9d8d92f7b2e0"
 *     responses:
 *       200:
 *         description: Successfully removed event.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: object
 *                   description: Confirmation message.
 *                   example: { "deletedCount": 1 }
 *       400:
 *         description: Bad request, invalid or missing event ID.
 *       401:
 *         description: Unauthorized, invalid or missing authentication token.
 *       500:
 *         description: Internal server error, issue with event deletion.
 */
router.route("/removeEvent").post(myAuth, async function (req, res) {
  Event.deleteMany({ id: req.body.id }, function (err, item) {
    if (err) {
      res.status(202).send({ error: err });
    } else {
      res.status(200).send({ message: item });
    }
  });
});

/**
 * @swagger
 * /monroo/apis/user/SaveEvent:
 *   post:
 *     summary: Save or update an event
 *     description: Saves a new event or updates an existing event based on the provided ID. The request must include user authentication.
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: ID of the event to be updated. If provided, the event will be updated. If not provided, a new event will be created.
 *                 example: "e4a0d77e-1f82-44f3-9c4a-9d8d92f7b2e0"
 *               title:
 *                 type: string
 *                 description: Title of the event.
 *                 example: "Annual Conference"
 *               desc:
 *                 type: string
 *                 description: Description of the event.
 *                 example: "A yearly conference to discuss the latest in technology."
 *               createdDate:
 *                 type: string
 *                 format: date
 *                 description: The date the event was created.
 *                 example: "2024-08-24"
 *               eventDate:
 *                 type: string
 *                 format: date
 *                 description: The date of the event.
 *                 example: "2024-09-15"
 *               eventEndDate:
 *                 type: string
 *                 format: date
 *                 description: The end date of the event.
 *                 example: "2024-09-16"
 *               location:
 *                 type: string
 *                 description: Location where the event will take place.
 *                 example: "Dubai International Convention Center"
 *               languages:
 *                 type: string
 *                 description: Languages in which the event will be conducted.
 *                 example: "English, Arabic"
 *               gender:
 *                 type: integer
 *                 description: Gender preference for the event.
 *                 example: 1
 *               duration:
 *                 type: string
 *                 description: Duration of the event.
 *                 example: "2 days"
 *               averageCost:
 *                 type: string
 *                 description: Average cost to attend the event.
 *                 example: "$200"
 *               dealCost:
 *                 type: string
 *                 description: Special deal cost for the event.
 *                 example: "$150"
 *               status:
 *                 type: integer
 *                 description: Current status of the event.
 *                 example: 0
 *     responses:
 *       200:
 *         description: Successfully saved or updated event. Returns the event details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Unique ID of the event.
 *                   example: "e4a0d77e-1f82-44f3-9c4a-9d8d92f7b2e0"
 *                 title:
 *                   type: string
 *                   description: Title of the event.
 *                   example: "Annual Conference"
 *                 desc:
 *                   type: string
 *                   description: Description of the event.
 *                   example: "A yearly conference to discuss the latest in technology."
 *                 createdDate:
 *                   type: string
 *                   description: The date the event was created.
 *                   example: "2024-08-24"
 *                 eventDate:
 *                   type: string
 *                   description: The date of the event.
 *                   example: "2024-09-15"
 *                 eventEndDate:
 *                   type: string
 *                   description: The end date of the event.
 *                   example: "2024-09-16"
 *                 location:
 *                   type: string
 *                   description: Location where the event will take place.
 *                   example: "Dubai International Convention Center"
 *                 languages:
 *                   type: string
 *                   description: Languages in which the event will be conducted.
 *                   example: "English, Arabic"
 *                 gender:
 *                   type: integer
 *                   description: Gender preference for the event.
 *                   example: 1
 *                 duration:
 *                   type: string
 *                   description: Duration of the event.
 *                   example: "2 days"
 *                 averageCost:
 *                   type: string
 *                   description: Average cost to attend the event.
 *                   example: "$200"
 *                 dealCost:
 *                   type: string
 *                   description: Special deal cost for the event.
 *                   example: "$150"
 *                 status:
 *                   type: integer
 *                   description: Current status of the event.
 *                   example: 0
 *       400:
 *         description: Bad request, invalid or missing event data.
 *       401:
 *         description: Unauthorized, invalid or missing authentication token.
 *       500:
 *         description: Internal server error, issue with event saving or updating.
 */
router.post("/SaveEvent", auth, async function (req, res) {
  try {
    const { id, ...newEventData } = req.body;
    let oldEvent = await Event.findOne({ id: id });
    if (oldEvent) {
      // Update the oldEvent with new data
      Object.assign(oldEvent, newEventData);
      await oldEvent.save();
      return returnData(res, oldEvent);
    } else {
      returnError(res, "Event not found");
    }
    const event = Event(req.body);
    event.userID = req.user.userID;
    event.country = req.user.country;
    if (event) {
      event.id = crypto.randomUUID();
      event.save(function (err) {
        if (err) {
          return returnError(res, "Failed" + err);
        } else {
          return returnData(res, event);
        }
      });
    } else {
      return returnError(res, "Data Not Correct");
    }
  } catch (err) {
    return returnError(res, "Data Not Correct");
  }
});

/**
 * @swagger
 * /monroo/apis/user/GetUserEvents:
 *   post:
 *     summary: Retrieve all events for the authenticated user
 *     description: Fetches a list of events associated with the authenticated user. Requires a valid authentication token.
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user events. Returns a list of event objects.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Unique ID of the event.
 *                     example: "e4a0d77e-1f82-44f3-9c4a-9d8d92f7b2e0"
 *                   title:
 *                     type: string
 *                     description: Title of the event.
 *                     example: "Annual Conference"
 *                   desc:
 *                     type: string
 *                     description: Description of the event.
 *                     example: "A yearly conference to discuss the latest in technology."
 *                   createdDate:
 *                     type: string
 *                     description: The date the event was created.
 *                     example: "2024-08-24"
 *                   eventDate:
 *                     type: string
 *                     description: The date of the event.
 *                     example: "2024-09-15"
 *                   eventEndDate:
 *                     type: string
 *                     description: The end date of the event.
 *                     example: "2024-09-16"
 *                   location:
 *                     type: string
 *                     description: Location where the event will take place.
 *                     example: "Dubai International Convention Center"
 *                   languages:
 *                     type: string
 *                     description: Languages in which the event will be conducted.
 *                     example: "English, Arabic"
 *                   gender:
 *                     type: integer
 *                     description: Gender preference for the event.
 *                     example: 1
 *                   duration:
 *                     type: string
 *                     description: Duration of the event.
 *                     example: "2 days"
 *                   averageCost:
 *                     type: string
 *                     description: Average cost to attend the event.
 *                     example: "$200"
 *                   dealCost:
 *                     type: string
 *                     description: Special deal cost for the event.
 *                     example: "$150"
 *                   status:
 *                     type: integer
 *                     description: Current status of the event.
 *                     example: 0
 *       401:
 *         description: Unauthorized, invalid or missing authentication token.
 *       500:
 *         description: Internal server error, issue with retrieving events.
 */
router.post("/GetUserEvents", auth, function (req, res) {
  try {
    const userID = req.user.userID;
    Event.find({ userID: userID }, function (err, items) {
      if (err) {
        return returnError(res, "Failed" + err);
      } else {
        return returnData(res, items);
      }
    });
  } catch (err) {
    return returnError(res, "Failed" + err);
  }
});

/**
 * @swagger
 * /monroo/apis/user/cancelEvent:
 *   post:
 *     summary: Cancel an event
 *     description: Allows the authenticated user to cancel an event by setting its status to 'canceled'. Requires a valid authentication token.
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       description: Event cancellation request body
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventID:
 *                 type: string
 *                 description: Unique identifier of the event to be canceled.
 *                 example: "e4a0d77e-1f82-44f3-9c4a-9d8d92f7b2e0"
 *     responses:
 *       200:
 *         description: Successfully canceled the event. Returns the updated event object.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Unique ID of the event.
 *                   example: "e4a0d77e-1f82-44f3-9c4a-9d8d92f7b2e0"
 *                 title:
 *                   type: string
 *                   description: Title of the event.
 *                   example: "Annual Conference"
 *                 desc:
 *                   type: string
 *                   description: Description of the event.
 *                   example: "A yearly conference to discuss the latest in technology."
 *                 createdDate:
 *                   type: string
 *                   description: The date the event was created.
 *                   example: "2024-08-24"
 *                 eventDate:
 *                   type: string
 *                   description: The date of the event.
 *                   example: "2024-09-15"
 *                 eventEndDate:
 *                   type: string
 *                   description: The end date of the event.
 *                   example: "2024-09-16"
 *                 location:
 *                   type: string
 *                   description: Location where the event will take place.
 *                   example: "Dubai International Convention Center"
 *                 languages:
 *                   type: string
 *                   description: Languages in which the event will be conducted.
 *                   example: "English, Arabic"
 *                 gender:
 *                   type: integer
 *                   description: Gender preference for the event.
 *                   example: 1
 *                 duration:
 *                   type: string
 *                   description: Duration of the event.
 *                   example: "2 days"
 *                 averageCost:
 *                   type: string
 *                   description: Average cost to attend the event.
 *                   example: "$200"
 *                 dealCost:
 *                   type: string
 *                   description: Special deal cost for the event.
 *                   example: "$150"
 *                 status:
 *                   type: integer
 *                   description: Current status of the event (4 = Canceled).
 *                   example: 4
 *       400:
 *         description: Bad request, eventID is missing or invalid.
 *       401:
 *         description: Unauthorized, invalid or missing authentication token.
 *       500:
 *         description: Internal server error, issue with canceling the event.
 */
router.post("/cancelEvent", auth, function (req, res) {
  try {
    const eventID = req.body.eventID;
    Event.findOne({ id: eventID }, function (err, item) {
      if (err) {
        return returnError(res, "Failed" + err);
      } else {
        if (item) {
          if (item.providerID) {
            var message = Message();
            message.id = crypto.randomUUID();
            message.msg = "";
            message.type = 1;
            message.providerID = item.providerID;
            message.eventID = eventID;
            message.userID =
              req.user.userID === item.providerID
                ? item.userID
                : item.providerID;
            message.senderID =
              req.user.userID === item.providerID
                ? item.userID
                : item.providerID;
            message.msgStatus = 3;
            message.save(function (err) {
              if (err) {
                return returnError(res, "Failed" + err);
              } else {
                // return returnData(res , true);

                item.status = 4; // cancel
                item.save();
                sendNotification(
                  item.providerID,
                  "Event Canceled",
                  "Event has been canceled",
                  "Cancel"
                );
                return returnData(res, item);
              }
            });
          } else {
            item.status = 4; // cancel
            item.save();
            sendNotification(
              item.providerID,
              "Event Canceled",
              "Event has been canceled",
              "Cancel"
            );
            return returnData(res, item);
          }
        } else {
          return returnError(res, "Failed, event not found");
        }
      }
    });
  } catch (err) {
    return returnError(res, "Failed" + err);
  }
});

/**
 * @swagger
 * /monroo/apis/user/GetReviews:
 *   post:
 *     summary: Retrieve reviews for a provider
 *     description: Fetches all reviews associated with a specific provider based on the `providerID`. Requires an authenticated user.
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       description: Request body containing the provider ID for which reviews need to be fetched.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               providerID:
 *                 type: string
 *                 description: Unique identifier of the provider whose reviews are to be retrieved.
 *                 example: "provider-12345"
 *     responses:
 *       200:
 *         description: Successfully retrieved the reviews for the specified provider.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Unique identifier of the review.
 *                     example: "review-67890"
 *                   userID:
 *                     type: string
 *                     description: Unique identifier of the user who wrote the review.
 *                     example: "user-54321"
 *                   providerID:
 *                     type: string
 *                     description: Unique identifier of the provider being reviewed.
 *                     example: "provider-12345"
 *                   stars:
 *                     type: number
 *                     description: Rating given in the review, on a scale (e.g., 1-5 stars).
 *                     example: 4
 *                   comment:
 *                     type: string
 *                     description: Text of the review or comment.
 *                     example: "Great service and very professional."
 *                   isProvider:
 *                     type: boolean
 *                     description: Indicates if the reviewer is a provider.
 *                     example: false
 *       400:
 *         description: Bad request if `providerID` is missing or invalid.
 *       401:
 *         description: Unauthorized if the authentication token is invalid or missing.
 *       500:
 *         description: Internal server error if there is an issue retrieving the reviews.
 */
router.post("/GetReviews", auth, function (req, res) {
  try {
    const userID = req.user.userID;
    const providerID = req.body.providerID;
    Reviews.find({ providerID: providerID }, function (err, items) {
      if (err) {
        return returnError(res, "Failed" + err);
      } else {
        return returnData(res, items);
      }
    });
  } catch (err) {
    return returnError(res, "Failed" + err);
  }
});

/**
 * @swagger
 * /monroo/apis/user/AddReview:
 *   post:
 *     summary: Add a review for a provider
 *     description: Allows an authenticated user to add a review for a specific provider. The user can only submit one review per provider.
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       description: Request body containing the review details.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               providerID:
 *                 type: string
 *                 description: Unique identifier of the provider being reviewed.
 *                 example: "provider-12345"
 *               stars:
 *                 type: number
 *                 description: Rating given in the review, on a scale (e.g., 1-5 stars).
 *                 example: 4
 *               comment:
 *                 type: string
 *                 description: Text of the review or comment.
 *                 example: "Excellent service and very friendly staff."
 *     responses:
 *       200:
 *         description: Successfully added the review.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Review added successfully."
 *       400:
 *         description: Bad request if the review details are incorrect or missing.
 *       401:
 *         description: Unauthorized if the authentication token is invalid or missing.
 *       409:
 *         description: Conflict if the user has already submitted a review for the provider.
 *       500:
 *         description: Internal server error if there is an issue saving the review.
 */
router.post("/AddReview", auth, async function (req, res) {
  try {
    const review = new Reviews(req.body);
    const userID = req.user.userID;
    review.userID = userID;
    review.isProvider = false;

    const oldReview = await Reviews.findOne({
      userID: userID,
      providerID: review.providerID,
      isProvider: false,
    });
    if (oldReview) {
      return returnError(res, "Already Rated!");
    }

    review.id = crypto.randomUUID();
    await review.save();

    // Update provider's average rating
    const provider = await Provider.findOne({ id: review.providerID });
    if (provider) {
      const totalRatings = provider.totalRatings + 1;
      const newAverageRating =
        (provider.averageRating * provider.totalRatings + review.stars) /
        totalRatings;

      await Provider.updateOne(
        { id: review.providerID },
        {
          $set: {
            averageRating: newAverageRating,
            totalRatings: totalRatings,
          },
        }
      );
    }

    return returnData(res, true);
  } catch (err) {
    return returnError(res, "Failed: " + err);
  }
});

/**
 * @swagger
 * /monroo/apis/user/ListProviders:
 *   post:
 *     summary: List providers based on user interests or all providers, with optional rating filter
 *     description: Retrieves a list of providers. You can either get all providers with a valid `dob` field or filter providers based on the user's interested categories and minimum rating.
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       description: Request body to specify filtering criteria.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isAll:
 *                 type: boolean
 *                 description: Whether to list all providers (if true) or filter by user's interested categories (if false).
 *                 example: true
 *               minRating:
 *                 type: number
 *                 description: Minimum average rating of providers to include (0-5).
 *                 example: 4
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of providers.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Provider'
 *       400:
 *         description: Bad request if the input data is incorrect or missing.
 *       401:
 *         description: Unauthorized if the authentication token is invalid or missing.
 *       500:
 *         description: Internal server error if there is an issue with the database or server.
 */
router.post("/ListProviders", async function (req, res) {
  try {
    const isAll = req.body.isAll || true;
    const userID = req.user.userID;
    const minRating = req.body.minRating || 0;

    const user = await User.findOne({ id: userID });
    if (!user) {
      return returnError(res, "User info not detected");
    }

    let query = {
      dob: { $exists: true, $ne: null, $not: { $eq: "" } },
      averageRating: { $gte: minRating },
    };

    if (!isAll) {
      query.catID = { $in: user.intrestedList };
    }

    Provider.find(query, function (err, items) {
      if (err) {
        return returnError(res, err);
      } else {
        return returnData(res, items);
      }
    });
  } catch (err) {
    return returnError(res, "Data Not Correct: " + err);
  }
});

/**
 * @swagger
 * /monroo/apis/user/ListOutProviders:
 *   post:
 *     summary: List all providers
 *     description: Retrieves a list of all providers available in the system.
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of providers.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Provider'
 *       400:
 *         description: Bad request if the input data is incorrect or missing.
 *       401:
 *         description: Unauthorized if the authentication token is invalid or missing.
 *       500:
 *         description: Internal server error if there is an issue with the database or server.
 */
router.post("/ListOutProviders", myAuth, async function (req, res) {
  try {
    // const isAll = req.body.isAll;
    Provider.find(function (err, items) {
      if (err) {
        return returnError(res, err);
      } else {
        return returnData(res, items);
      }
    });
  } catch (err) {
    return returnError(res, "Data Not Correct");
  }
});

/**
 * @swagger
 * /monroo/apis/user/SearchProviders:
 *   post:
 *     summary: Search for providers based on key and category IDs
 *     description: Searches for providers using a keyword and filters by category IDs.
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *                 description: The search keyword to match against provider bios, first names, or experiences.
 *                 example: "software developer"
 *               ids:
 *                 type: string
 *                 description: JSON array of category IDs to filter providers.
 *                 example: '["category1", "category2"]'
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of providers that match the search criteria.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Provider'
 *       400:
 *         description: Bad request if the input data is incorrect or missing.
 *       401:
 *         description: Unauthorized if the authentication token is invalid or missing.
 *       500:
 *         description: Internal server error if there is an issue with the database or server.
 */
router.post("/SearchProviders", auth, async function (req, res) {
  try {
    const key = req.body.key;
    const ids = req.body.ids;
    console.log("key", key);
    console.log("ids", ids);
    Provider.find(
      {
        $and: [
          {
            $or: [
              { bio: { $regex: key, $options: "i" } },
              { fname: { $regex: key, $options: "i" } },
              { experience: { $regex: key, $options: "i" } },
            ],
          },
          { catID: { $in: JSON.parse(ids) } },
        ],
      },
      function (err, items) {
        if (err) {
          return returnError(res, err);
        } else {
          return returnData(res, items);
        }
      }
    );
  } catch (err) {
    return returnError(res, err);
  }
});

/**
 * @swagger
 * /monroo/apis/user/GetProviderProfile:
 *   post:
 *     summary: Retrieve provider profile by ID
 *     description: Fetches the profile details of a provider using their unique provider ID.
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               providerID:
 *                 type: string
 *                 description: Unique identifier of the provider whose profile is to be retrieved.
 *                 example: "provider-12345"
 *     responses:
 *       200:
 *         description: Successfully retrieved the provider profile.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Provider'
 *       400:
 *         description: Bad request if the input data is incorrect or missing.
 *       401:
 *         description: Unauthorized if the authentication token is invalid or missing.
 *       500:
 *         description: Internal server error if there is an issue with the database or server.
 */
router.post("/GetProviderProfile", auth, async function (req, res) {
  try {
    var providerID = req.body.providerID;
    Provider.findOne({ id: providerID }, async function (err, item) {
      if (err) {
        return returnError(res, "Failed " + err);
      } else {
        if (item) {
          return returnData(res, item);
        }
      }
    });
  } catch (err) {
    return returnError(res, "Failed " + err);
  }
});

/**
 * @swagger
 * /monroo/apis/user/RequestEvent:
 *   post:
 *     summary: Request an event
 *     description: Creates a request for a specific event by sending a message to the provider. Prevents duplicate requests for the same event.
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventID:
 *                 type: string
 *                 description: The unique identifier of the event being requested.
 *                 example: "event-12345"
 *               providerID:
 *                 type: string
 *                 description: The unique identifier of the provider to whom the request is sent.
 *                 example: "provider-67890"
 *     responses:
 *       200:
 *         description: Request for the event was successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: boolean
 *               example: true
 *       400:
 *         description: Bad request if the input data is incorrect or missing.
 *       401:
 *         description: Unauthorized if the authentication token is invalid or missing.
 *       404:
 *         description: Event not found or event has been canceled.
 *       409:
 *         description: Conflict if the event has already been requested.
 *       500:
 *         description: Internal server error if there is an issue with the database or server.
 */
router.post("/RequestEvent", auth, async function (req, res) {
  try {
    const eventID = req.body.eventID;
    const providerID = req.body.providerID;
    let msgs = await Message.find({
      $and: [{ eventID: eventID }, { msgStatus: { $ne: 3 } }],
    });
    if (msgs && msgs.length > 0) {
      return returnError(res, "This event has been requested before");
    }
    let event = await Event.findOne({ id: eventID });
    if (event && event.status == 4) {
      return returnError(
        res,
        "This event has been canceled, please create new one"
      );
    }
    if (providerID && eventID) {
      var message = Message();
      message.id = crypto.randomUUID();
      message.msg = "";
      message.type = 1;
      message.providerID = providerID;
      message.eventID = eventID;
      message.userID = req.user.userID;
      message.senderID = req.user.userID;
      message.save(function (err) {
        if (err) {
          return returnError(res, "Failed" + err);
        } else {
          sendNotification(
            providerID,
            "Event Requested",
            "You have new event request",
            "RequestEvent"
          );
          return returnData(res, true);
        }
      });
    } else {
      return returnError(res, "Data Not Correct");
    }
  } catch (err) {
    return returnError(res, "Data Not Correct");
  }
});

/**
 * @swagger
 * /monroo/apis/user/MakeADeal:
 *   post:
 *     summary: Make a deal request for an event
 *     description: Sends a deal request for a specific event to a provider with the proposed deal price. Updates the status of the previous message related to the event.
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventID:
 *                 type: string
 *                 description: The unique identifier of the event for which the deal is being made.
 *                 example: "event-12345"
 *               msgID:
 *                 type: string
 *                 description: The unique identifier of the previous message related to the event.
 *                 example: "msg-67890"
 *               providerID:
 *                 type: string
 *                 description: The unique identifier of the provider to whom the deal request is sent.
 *                 example: "provider-54321"
 *               dealPrice:
 *                 type: string
 *                 description: The proposed price for the deal.
 *                 example: "1500"
 *     responses:
 *       200:
 *         description: Deal request was successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: boolean
 *               example: true
 *       400:
 *         description: Bad request if the input data is incorrect or missing.
 *       401:
 *         description: Unauthorized if the authentication token is invalid or missing.
 *       404:
 *         description: Not Found if the event or message ID is not found.
 *       500:
 *         description: Internal server error if there is an issue with the database or server.
 */
router.post("/MakeADeal", auth, async function (req, res) {
  try {
    const eventID = req.body.eventID;
    const msgID = req.body.msgID;
    const providerID = req.body.providerID;
    const dealPrice = req.body.dealPrice;
    if (providerID && eventID) {
      var message = Message();
      message.id = crypto.randomUUID();
      message.msg = dealPrice;
      message.type = 5;
      message.providerID = providerID;
      message.eventID = eventID;
      message.userID = req.user.userID;
      message.senderID = req.user.userID;
      message.save(async function (err) {
        if (err) {
          return returnError(res, "Failed" + err);
        } else {
          try {
            let oldmsg = await Message.findOne({ id: msgID });
            oldmsg.msgStatus = 4;
            oldmsg.save();
          } catch (ex) {
            console.log(ex);
          }

          sendNotification(
            providerID,
            "Deal Requested",
            "You have new event deal request",
            "RequestDeal"
          );

          return returnData(res, true);
        }
      });
    } else {
      return returnError(res, "Data Not Correct");
    }
  } catch (err) {
    return returnError(res, "Data Not Correct");
  }
});

/**
 * @swagger
 * /monroo/apis/user/RejectDeal:
 *   post:
 *     summary: Reject a deal request for an event
 *     description: Updates the status of a specific deal request message to indicate that the deal has been rejected. Sends a notification to the user who made the deal request.
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userID:
 *                 type: string
 *                 description: The unique identifier of the user who made the deal request.
 *                 example: "user-12345"
 *               providerID:
 *                 type: string
 *                 description: The unique identifier of the provider who is rejecting the deal.
 *                 example: "provider-54321"
 *               eventID:
 *                 type: string
 *                 description: The unique identifier of the event related to the deal request.
 *                 example: "event-67890"
 *               msgID:
 *                 type: string
 *                 description: The unique identifier of the message related to the deal request.
 *                 example: "msg-98765"
 *     responses:
 *       200:
 *         description: Deal request was successfully rejected.
 *         content:
 *           application/json:
 *             schema:
 *               type: boolean
 *               example: true
 *       400:
 *         description: Bad request if the input data is incorrect or missing.
 *       401:
 *         description: Unauthorized if the authentication token is invalid or missing.
 *       404:
 *         description: Not Found if the message or event ID is not found.
 *       500:
 *         description: Internal server error if there is an issue with the database or server.
 */
router.post("/RejectDeal", auth, async function (req, res) {
  try {
    const userID = req.body.userID;
    const providerID = req.body.providerID;
    const eventID = req.body.eventID;
    const msgID = req.body.msgID;
    if ((userID && providerID && eventID, msgID)) {
      var messageOld = await Message.findOne({ id: msgID });
      if (messageOld) {
        messageOld.msgStatus = 7;
        messageOld.save(async function (err) {
          if (err) {
            return returnError(res, "Failed" + err);
          } else {
            sendNotification(
              userID,
              "Deal Rejected",
              "a deal has been rejected",
              "RejectDeal",
              true
            );

            return returnData(res, true);
          }
        });
      } else {
        return returnError(res, "Failed, Event not found");
      }
    } else {
      return returnError(res, "wrong sent data");
    }
  } catch (err) {
    return returnError(res, err.message);
  }
});

/**
 * @swagger
 * /monroo/apis/user/ApproveDeal:
 *   post:
 *     summary: Approve a deal request for an event
 *     description: Approves a deal request, updates the event status to "booked", and creates a new message to indicate that the deal has been approved. Also updates or creates a permission record.
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userID:
 *                 type: string
 *                 description: The unique identifier of the user who is approving the deal.
 *                 example: "user-12345"
 *               providerID:
 *                 type: string
 *                 description: The unique identifier of the provider involved in the deal.
 *                 example: "provider-54321"
 *               eventID:
 *                 type: string
 *                 description: The unique identifier of the event for which the deal is being approved.
 *                 example: "event-67890"
 *               msgID:
 *                 type: string
 *                 description: The unique identifier of the message related to the deal request.
 *                 example: "msg-98765"
 *     responses:
 *       200:
 *         description: Deal request was successfully approved and the event status was updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: boolean
 *               example: true
 *       400:
 *         description: Bad request if the input data is incorrect or missing.
 *       401:
 *         description: Unauthorized if the authentication token is invalid or missing.
 *       404:
 *         description: Not Found if the event or message ID is not found.
 *       500:
 *         description: Internal server error if there is an issue with the database or server.
 */
router.post("/ApproveDeal", auth, function (req, res) {
  try {
    const userID = req.body.userID;
    const providerID = req.body.providerID;
    const eventID = req.body.eventID;
    const msgID = req.body.msgID;
    if ((userID && providerID && eventID, msgID)) {
      Event.findOne({ id: eventID }, async function (err, event) {
        var messageOld = await Message.findOne({ id: msgID });
        if (event && messageOld) {
          // console.log("oldmsg" , messageOld.msg);
          event.dealCost = messageOld.msg;
          event.providerID = providerID;
          event.status = 1; // booked
          await event.save();
          var message = Message();
          message.id = crypto.randomUUID();
          message.msg = messageOld.msg;
          message.type = 6;
          message.providerID = providerID;
          message.eventID = eventID;
          message.userID = userID;
          message.senderID = providerID;
          message.save(async function (err) {
            if (err) {
              return returnError(res, "Failed" + err);
            } else {
              let permission = await Permission.findOne({
                userID: userID,
                providerID: providerID,
                eventID: eventID,
              });
              if (permission) {
                permission.isWaitingPayment = true;
                permission.isAllowed = true;
                permission.eventDoneSucces = false;
                await permission.save();
                try {
                  messageOld.msgStatus = 5;
                  messageOld.save();
                } catch (ex) {
                  console.log(ex);
                }
                sendNotification(
                  userID,
                  "Deal Requested",
                  "You have new event deal request",
                  "RequestDeal",
                  true
                );

                return returnData(res, true);
              } else {
                // create new permission and save
                return returnError(res, "Failed, Permission error occured");
              }
            }
          });
        } else {
          return returnError(res, "Failed, Event not found");
        }
      });
    } else {
      return returnError(res, "wrong sent data");
    }
  } catch (err) {
    return returnError(res, err.message);
  }
});

/**
 * @swagger
 * /monroo/apis/user/getMessagesProfiles:
 *   post:
 *     summary: Retrieve profiles of message senders for a user
 *     description: Fetches a list of profiles for users who have sent messages to the currently authenticated user. The response includes sender details and message metadata.
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userID:
 *                 type: string
 *                 description: The unique identifier of the user whose messages are being retrieved.
 *                 example: "user-12345"
 *     responses:
 *       200:
 *         description: Successfully retrieves the list of sender profiles and associated messages.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   messageID:
 *                     type: string
 *                     description: The unique identifier of the message.
 *                     example: "msg-12345"
 *                   senderID:
 *                     type: string
 *                     description: The unique identifier of the sender.
 *                     example: "provider-54321"
 *                   senderName:
 *                     type: string
 *                     description: The name of the sender.
 *                     example: "John Doe"
 *                   senderPhoto:
 *                     type: string
 *                     description: The profile picture URL of the sender.
 *                     example: "http://example.com/photo.jpg"
 *                   msgDate:
 *                     type: string
 *                     description: The date when the message was sent.
 *                     example: "2024-08-24T12:34:56Z"
 *       400:
 *         description: Bad request if the input data is incorrect or missing.
 *       401:
 *         description: Unauthorized if the authentication token is invalid or missing.
 *       500:
 *         description: Internal server error if there is an issue with the database or server.
 */
router.post("/getMessagesProfiles", auth, function (req, res) {
  try {
    const userID = req.user.userID;
    Message.find({ userID: userID }, async function (err, items) {
      if (err) {
        returnError(res, err);
      } else {
        const ids = items.map(({ providerID }) => providerID);
        const filtered = items.filter(
          ({ providerID }, index) => !ids.includes(providerID, index + 1)
        );
        var response = [];
        for (const item of filtered) {
          const sender = await Provider.findOne({ id: item.providerID });
          if (!sender) continue;
          var data = {};
          data.messageID = item.id;
          data.senderID = item.providerID;
          data.senderName = sender.fname;
          data.senderPhoto = sender.profilePic;
          data.msgDate = item.msgDate;
          response.push(data);
        }
        returnData(res, response);
      }
    });
  } catch (err) {
    return returnError(res, "Data Not Correct");
  }
});

/**
 * @swagger
 * /monroo/apis/user/getDetailedMessages:
 *   post:
 *     summary: Retrieve detailed messages between a user and a provider
 *     description: Fetches a list of messages between the currently authenticated user and a specified provider, including event details if applicable.
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               providerID:
 *                 type: string
 *                 description: The unique identifier of the provider whose messages are being retrieved.
 *                 example: "provider-54321"
 *     responses:
 *       200:
 *         description: Successfully retrieves the detailed messages including event details where applicable.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The unique identifier for the message.
 *                     example: "msg-12345"
 *                   msg:
 *                     type: string
 *                     description: The content of the message.
 *                     example: "Hello, let's discuss the event."
 *                   type:
 *                     type: integer
 *                     description: The type of the message.
 *                     example: 1
 *                   providerID:
 *                     type: string
 *                     description: The unique identifier of the provider associated with the message.
 *                     example: "provider-54321"
 *                   userID:
 *                     type: string
 *                     description: The unique identifier of the user associated with the message.
 *                     example: "user-12345"
 *                   senderID:
 *                     type: string
 *                     description: The unique identifier of the sender.
 *                     example: "provider-54321"
 *                   eventID:
 *                     type: string
 *                     description: The unique identifier of the event related to the message.
 *                     example: "event-67890"
 *                   msgDate:
 *                     type: string
 *                     description: The date when the message was sent.
 *                     example: "2024-08-24T12:34:56Z"
 *                   eventObj:
 *                     type: object
 *                     description: The event object related to the message (if applicable).
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: The unique identifier of the event.
 *                         example: "event-67890"
 *                       title:
 *                         type: string
 *                         description: The title of the event.
 *                         example: "Annual Conference"
 *                       date:
 *                         type: string
 *                         description: The date of the event.
 *                         example: "2024-09-15T09:00:00Z"
 *                       location:
 *                         type: string
 *                         description: The location of the event.
 *                         example: "New York City, NY"
 *                   msgStatus:
 *                     type: integer
 *                     description: The status of the message.
 *                     example: 1
 *       400:
 *         description: Bad request if the input data is incorrect or missing.
 *       401:
 *         description: Unauthorized if the authentication token is invalid or missing.
 *       500:
 *         description: Internal server error if there is an issue with the database or server.
 */
router.post("/getDetailedMessages", auth, async function (req, res) {
  try {
    const userID = req.user.userID;
    const providerID = req.body.providerID;
    Message.find(
      { providerID: providerID, userID: userID },
      async function (err, items) {
        if (err) {
          returnError(res, err);
        } else {
          for (var item of items) {
            if (
              item.type === 1 ||
              item.type === 4 ||
              item.type === 5 ||
              item.type === 6
            ) {
              const event = await Event.findOne({ id: item.eventID });
              item.eventObj = event;
            }
          }
          returnData(res, items);
        }
      }
    );
  } catch (err) {
    return returnError(res, "Data Not Correct");
  }
});

/**
 * @swagger
 * /monroo/apis/user/getPermission:
 *   post:
 *     summary: Retrieve permission details for a user-provider-event combination
 *     description: Checks and retrieves permission details for a specified user, provider, and event. Returns permission data if available, otherwise indicates that sending is not allowed.
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userID:
 *                 type: string
 *                 description: The unique identifier of the user.
 *                 example: "user-12345"
 *               providerID:
 *                 type: string
 *                 description: The unique identifier of the provider.
 *                 example: "provider-54321"
 *               eventID:
 *                 type: string
 *                 description: The unique identifier of the event.
 *                 example: "event-67890"
 *     responses:
 *       200:
 *         description: Successfully retrieves permission details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The unique identifier for the permission record.
 *                   example: "perm-98765"
 *                 userID:
 *                   type: string
 *                   description: The unique identifier of the user.
 *                   example: "user-12345"
 *                 providerID:
 *                   type: string
 *                   description: The unique identifier of the provider.
 *                   example: "provider-54321"
 *                 eventID:
 *                   type: string
 *                   description: The unique identifier of the event.
 *                   example: "event-67890"
 *                 isAllowed:
 *                   type: boolean
 *                   description: Indicates if the user is allowed to interact with the event.
 *                   example: true
 *                 isWaitingPayment:
 *                   type: boolean
 *                   description: Indicates if payment is pending for the event.
 *                   example: false
 *                 eventDoneSucces:
 *                   type: boolean
 *                   description: Indicates if the event was completed successfully.
 *                   example: false
 *       400:
 *         description: Bad request if the input data is incorrect or missing.
 *       401:
 *         description: Unauthorized if the authentication token is invalid or missing.
 *       500:
 *         description: Internal server error if there is an issue with the database or server.
 */
router.post("/getPermission", auth, async function (req, res) {
  try {
    const userID = req.body.userID;
    const providerID = req.body.providerID;
    const eventID = req.body.eventID;
    Permission.findOne(
      { providerID: providerID, userID: userID, eventID: eventID },
      function (err, item) {
        if (err) {
          return returnError(res, err);
        } else {
          if (item) return returnData(res, item);
          else return returnError(res, "Send not allowed");
        }
      }
    );
  } catch (err) {
    return returnError(res, err);
  }
});

/**
 * @swagger
 * /monroo/apis/user/ApprovePermission:
 *   post:
 *     summary: Approve or update permissions for a user-provider-event combination
 *     description: Approves or updates the permissions for a specified user, provider, and event combination. Optionally, sets whether payment is waiting and if the user is allowed.
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userID:
 *                 type: string
 *                 description: The unique identifier of the user.
 *                 example: "user-12345"
 *               providerID:
 *                 type: string
 *                 description: The unique identifier of the provider.
 *                 example: "provider-54321"
 *               eventID:
 *                 type: string
 *                 description: The unique identifier of the event.
 *                 example: "event-67890"
 *               msgID:
 *                 type: string
 *                 description: The unique identifier of the message associated with the permission.
 *                 example: "msg-13579"
 *               permissionValue:
 *                 type: boolean
 *                 description: Indicates if the user is allowed to interact with the event.
 *                 example: true
 *               paymentwaiting:
 *                 type: boolean
 *                 description: Indicates if payment is pending for the event.
 *                 example: false
 *     responses:
 *       200:
 *         description: Successfully approved or updated the permission.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Permission'
 *       400:
 *         description: Bad request if the input data is incorrect or missing.
 *       401:
 *         description: Unauthorized if the authentication token is invalid or missing.
 *       500:
 *         description: Internal server error if there is an issue with the database or server.
 */
router.post("/ApprovePermission", auth, async function (req, res) {
  try {
    const userID = req.body.userID;
    const providerID = req.body.providerID;
    const eventID = req.body.eventID;
    const msgID = req.body.msgID;
    const permissionValue = req.body.permissionValue;
    const paymentwaiting = req.body.paymentwaiting;
    if (userID && providerID && eventID) {
      let permission = await Permission.findOne({
        userID: userID,
        providerID: providerID,
        eventID: eventID,
      });
      if (!permission || !permission.id) {
        permission = new Permission();
        permission.id = crypto.randomUUID();
      }
      permission.eventID = eventID;
      permission.providerID = providerID;
      permission.userID = userID;
      if (permissionValue === undefined || permissionValue === null)
        permission.isAllowed = true;
      else permission.isAllowed = permissionValue;
      if (paymentwaiting === undefined || paymentwaiting === null)
        permission.isWaitingPayment = false;
      else permission.isWaitingPayment = paymentwaiting;
      permission.save(async function (err) {
        if (err) {
          return returnError(res, err);
        } else {
          try {
            let message = await Message.findOne({ id: msgID });
            message.msgStatus = 2;
            message.save();
          } catch (ex) {
            console.log(ex);
          }
          sendNotification(
            providerID,
            "Message Allowed",
            "a conversation has been opend to talk",
            "PermissionAproved"
          );
          return returnData(res, permission);
        }
      });
    } else {
      return returnError(res, "wrong sent data");
    }
  } catch (err) {
    return returnError(res, err);
  }
});

/**
 * @swagger
 * /monroo/apis/user/DeclinePermission:
 *   post:
 *     summary: Decline or update permissions for a user-provider-event combination
 *     description: Declines or updates the permissions for a specified user, provider, and event combination. Optionally sets whether payment is waiting and if the user is allowed.
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userID:
 *                 type: string
 *                 description: The unique identifier of the user.
 *                 example: "user-12345"
 *               providerID:
 *                 type: string
 *                 description: The unique identifier of the provider.
 *                 example: "provider-54321"
 *               eventID:
 *                 type: string
 *                 description: The unique identifier of the event.
 *                 example: "event-67890"
 *               msgID:
 *                 type: string
 *                 description: The unique identifier of the message associated with the permission.
 *                 example: "msg-13579"
 *               permissionValue:
 *                 type: boolean
 *                 description: Indicates if the user is allowed to interact with the event. Defaults to `false` if not provided.
 *                 example: false
 *               paymentwaiting:
 *                 type: boolean
 *                 description: Indicates if payment is pending for the event. Defaults to `false` if not provided.
 *                 example: false
 *     responses:
 *       200:
 *         description: Successfully declined or updated the permission.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Permission'
 *       400:
 *         description: Bad request if the input data is incorrect or missing.
 *       401:
 *         description: Unauthorized if the authentication token is invalid or missing.
 *       500:
 *         description: Internal server error if there is an issue with the database or server.
 */
router.post("/DeclinePermission", auth, async function (req, res) {
  try {
    const userID = req.body.userID;
    const providerID = req.body.providerID;
    const eventID = req.body.eventID;
    const msgID = req.body.msgID;
    const permissionValue = req.body.permissionValue;
    const paymentwaiting = req.body.paymentwaiting;
    if (userID && providerID && eventID) {
      let permission = await Permission.findOne({
        userID: userID,
        providerID: providerID,
        eventID: eventID,
      });
      if (!permission || !permission.id) {
        permission = new Permission();
        permission.id = crypto.randomUUID();
      }
      permission.eventID = eventID;
      permission.providerID = providerID;
      permission.userID = userID;
      if (permissionValue === undefined || permissionValue === null)
        permission.isAllowed = false;
      else permission.isAllowed = permissionValue;
      if (paymentwaiting === undefined || paymentwaiting === null)
        permission.isWaitingPayment = false;
      else permission.isWaitingPayment = paymentwaiting;
      permission.save(async function (err) {
        if (err) {
          return returnError(res, err);
        } else {
          try {
            let message = await Message.findOne({ id: msgID });
            message.msgStatus = 3;
            message.save();
          } catch (ex) {
            console.log(ex);
          }
          sendNotification(
            providerID,
            "Request Declined",
            "Someone has declined your request",
            "PermissionDeclined"
          );
          return returnData(res, permission);
        }
      });
    } else {
      return returnError(res, "wrong sent data");
    }
  } catch (err) {
    return returnError(res, err);
  }
});

/**
 * @swagger
 * /monroo/apis/user/sendMessage:
 *   post:
 *     summary: Send a new message
 *     description: Creates and saves a new message in the database and sends a notification to the recipient provider.
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               msg:
 *                 type: string
 *                 description: The content of the message.
 *                 example: "Hello, I would like to discuss the event details."
 *               type:
 *                 type: integer
 *                 description: The type of message. Defaults to 0.
 *                 example: 2
 *               providerID:
 *                 type: string
 *                 description: The unique identifier of the provider who will receive the message.
 *                 example: "provider-54321"
 *               eventID:
 *                 type: string
 *                 description: The unique identifier of the event associated with the message (optional).
 *                 example: "event-67890"
 *     responses:
 *       200:
 *         description: Successfully created and saved the message.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: Bad request if the input data is incorrect or missing.
 *       401:
 *         description: Unauthorized if the authentication token is invalid or missing.
 *       500:
 *         description: Internal server error if there is an issue with the database or server.
 */
router.post("/sendMessage", auth, async function (req, res) {
  try {
    const message = Message(req.body);
    if (message) {
      const currentTimestampInMilliseconds = new Date().getTime();
      message.id = crypto.randomUUID();
      message.userID = req.user.userID;
      message.senderID = req.user.userID;
      message.msgDate = currentTimestampInMilliseconds;
      message.save(function (err) {
        if (err) {
          return returnError(res, "Failed" + err);
        } else {
          sendNotification(
            message.providerID,
            "New Message",
            "You have new message",
            "Message"
          );

          return returnData(res, message);
        }
      });
    } else {
      return returnError(res, "Data Not Correct");
    }
  } catch (err) {
    return returnError(res, "Data Not Correct");
  }
});

/**
 * @swagger
 * /monroo/apis/user/getBookings:
 *   post:
 *     summary: Retrieve user bookings
 *     description: Fetches the bookings of a user based on the booking status provided. Can filter bookings that are upcoming, past, or all.
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingStatus:
 *                 type: integer
 *                 description: The status of bookings to retrieve.
 *                 enum: [1, 2, 3]
 *                 example: 1
 *     responses:
 *       200:
 *         description: Successfully retrieved the bookings.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *       400:
 *         description: Bad request if the input data is incorrect or missing.
 *       401:
 *         description: Unauthorized if the authentication token is invalid or missing.
 *       500:
 *         description: Internal server error if there is an issue with the database or server.
 */
router.post("/getBookings", auth, async function (req, res) {
  try {
    const currentTimestampInMilliseconds = new Date().getTime();

    const bookingStatus = req.body.bookingStatus;
    const userID = req.user.userID;
    if (bookingStatus) {
      if (bookingStatus === 1) {
        Event.find(
          {
            userID: userID,
            status: { $ne: 4 },
            eventDate: { $gt: currentTimestampInMilliseconds },
          },
          async function (err, items) {
            if (err) {
              returnError(res, err);
            } else {
              console.log(items);
              returnData(res, items);
            }
          }
        );
      } else if (bookingStatus === 2) {
        Event.find(
          {
            userID: userID,
            eventDate: { $lt: currentTimestampInMilliseconds },
          },
          async function (err, items) {
            if (err) {
              returnError(res, err);
            } else {
              console.log(items);
              returnData(res, items);
            }
          }
        );
      } else {
        Event.find({ userID: userID }, async function (err, items) {
          if (err) {
            returnError(res, err);
          } else {
            console.log(items);
            returnData(res, items);
          }
        });
      }
    } else {
      Event.find(
        { userID: userID, status: { $ne: 4 } },
        async function (err, items) {
          if (err) {
            returnError(res, err);
          } else {
            console.log(items);
            returnData(res, items);
          }
        }
      );
    }
  } catch (err) {
    return returnError(res, "Data Not Correct");
  }
});

/**
 * @swagger
 * /monroo/apis/user/getAllUserBookings:
 *   post:
 *     summary: Retrieve all bookings for a user
 *     description: Fetches all bookings for the authenticated user, without filtering by status. Returns a list of events related to the user.
 *     tags: [User]
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all bookings for the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *       400:
 *         description: Bad request if there is an issue with the request or input data.
 *       401:
 *         description: Unauthorized if the authentication token is invalid or missing.
 *       500:
 *         description: Internal server error if there is an issue with the database or server.
 */
router.post("/getAllUserBookings", auth, async function (req, res) {
  try {
    const currentTimestampInMilliseconds = new Date().getTime();
    const userID = req.user.userID;
    console.log(userID);
    Event.find({ userID: userID }, async function (err, items) {
      if (err) {
        returnError(res, err);
      } else {
        console.log(items);
        returnData(res, items);
      }
    });
  } catch (err) {
    return returnError(res, "Data Not Correct");
  }
});

async function sendNotification(userID, title, body, type, isUser = false) {
  try {
    console.log("user id", userID);

    var tokens = [];
    if (isUser) {
      let user = await User.findOne({ id: userID });
      console.log("user user", user);

      if (user) {
        tokens.push(user.fcmToken);
      }
    } else {
      let provider = await Provider.findOne({ id: userID });
      console.log("user provider", provider);

      if (provider) {
        tokens.push(provider.fcmToken);
      }
    }

    const notification_options = {
      priority: "high",
      timeToLive: 60 * 60 * 24,
    };
    const message = {
      data: {
        title: title,
        body: body,
        type: type,
        sound: "default",
      },
      notification: {
        title: title,
        body: body,
        type: type,
        sound: "default",
      },
    };
    if (tokens.length > 0) {
      admin
        .messaging()
        .sendToDevice(tokens, message, notification_options)
        .then((response) => {
          console.log("Success sent message");
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      console.log("no fcms");
    }
  } catch (ex) {
    console.log(ex);
  }
}
function getToken(id, email, country) {
  return jwt.sign(
    { userID: id, email: email, country: country },
    process.env.JWT_KEY,
    {
      expiresIn: "24h",
    }
  );
}
function returnError(res, error) {
  return res.status(203).send({ status: 203, data: error });
}

function returnData(res, data) {
  return res.status(200).send({ status: 200, data: data });
}

module.exports = router;
