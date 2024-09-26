var express = require("express");
var router = express.Router();
var Provider = require("../models/provider.model");
var User = require("../models/users.model");
let uploadAll = require("../middleware/uploadAll");
var Event = require("../models/event.model");
let jwt = require("jsonwebtoken");
let auth = require("../middleware/auth");
let myAuth = require("../middleware/myAuth");
var Message = require("../models/message.model");
let bcrypt = require("bcryptjs");
const crypto = require("crypto");
var Reviews = require("../models/reviews.model");
const admin = require("../bin/fbinit");
const { use } = require("./user");

/**
 * @swagger
 * tags:
 *   name: Provider
 *   description: Operations related to payment
 */

function uuidv4() {
  return crypto.randomUUID();
}

/**
 * @swagger
 * /monroo/apis/provider/fcmToken:
 *   post:
 *     summary: Update the FCM token for a provider
 *     tags: [Provider]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       description: The FCM token to be updated for the provider.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fcmToken:
 *                 type: string
 *                 description: The FCM token for the provider.
 *     responses:
 *       200:
 *         description: Successful response with the updated provider information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The unique identifier of the provider.
 *                   example: "provider_123"
 *                 fcmToken:
 *                   type: string
 *                   description: The updated FCM token.
 *                   example: "d1f4b6f8-6d6c-11eb-9439-0242ac130002"
 *       400:
 *         description: Bad request if the FCM token is not provided.
 *       500:
 *         description: Internal server error if an issue occurs while updating the provider's FCM token.
 */
router.route("/fcmToken").post(auth, async function (req, res) {
  let userID = req.user.userID;
  let fcmToken = req.body.fcmToken;
  if (fcmToken) {
    let provider = await Provider.findOne({ id: userID });
    provider.fcmToken = fcmToken;
    await provider.save();
    console.log(provider);
    returnData(res, provider);
  } else {
    console.log("Fcm Token not found");

    returnError(res, "Fcm Token not found");
  }
});

/**
 * @swagger
 * /monroo/apis/provider/removeProvider:
 *   post:
 *     summary: Remove a provider by user ID
 *     tags: [Provider]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       description: The user ID of the provider to be removed.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userID:
 *                 type: string
 *                 description: The unique identifier of the provider to be removed.
 *                 example: "provider_123"
 *     responses:
 *       200:
 *         description: Successfully removed the provider(s).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message indicating that the provider(s) have been removed.
 *                   example: "Successfully removed provider(s)."
 *       202:
 *         description: Error occurred while trying to remove the provider(s).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: An error message if the removal fails.
 *                   example: "Error removing provider: Provider not found"
 *       500:
 *         description: Internal server error if an issue occurs during the removal process.
 */
router.route("/removeProvider").post(myAuth, async function (req, res) {
  Provider.deleteMany({ id: req.body.userID }, function (err, item) {
    if (err) {
      res.status(202).send({ error: err });
    } else {
      res.status(200).send({ message: item });
    }
  });
});

/**
 * @swagger
 * /monroo/apis/provider/loginSocial:
 *   post:
 *     summary: Login a user using social credentials
 *     tags: [Provider]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       description: The login credentials for social authentication
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username or email of the user.
 *                 example: "user@example.com"
 *               fcmToken:
 *                 type: string
 *                 description: The FCM token to be updated for the user (optional).
 *                 example: "fcm_token_example"
 *     responses:
 *       200:
 *         description: Successful login with user details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The unique identifier of the user.
 *                   example: "user_123"
 *                 email:
 *                   type: string
 *                   description: The email of the user.
 *                   example: "user@example.com"
 *                 countryOfResidence:
 *                   type: string
 *                   description: The country of residence of the user.
 *                   example: "USA"
 *                 token:
 *                   type: string
 *                   description: The authentication token for the user.
 *                   example: "auth_token_example"
 *                 status:
 *                   type: number
 *                   description: The status of the login operation.
 *                   example: 200
 *                 fcmToken:
 *                   type: string
 *                   description: The updated FCM token (if provided).
 *                   example: "fcm_token_example"
 *       400:
 *         description: Bad request if username is not provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: An error message indicating the issue.
 *                   example: "Username not detected"
 *       401:
 *         description: Unauthorized if the password does not match.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: An error message indicating wrong password.
 *                   example: "Wrong password"
 *       404:
 *         description: Not Found if the user is not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: An error message indicating the user was not found.
 *                   example: "Cannot find user"
 *       500:
 *         description: Internal server error if an issue occurs during the login process.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: An error message indicating an internal server issue.
 *                   example: "Cannot login [error details]"
 */
router.route("/loginSocial").post(myAuth, function (req, res) {
  let username = req.body.username;
  let fcmToken = req.body.fcmToken;
  if (username) {
    Provider.findOne(
      { $or: [{ username: username }, { email: username }] },
      function (err, item) {
        if (item && item.password) {
          let password = process.env.SOCIALPASS;
          if (!bcrypt.compareSync(password, item.password)) {
            return returnError(res, "Wrong password");
          }
          let token = getToken(item.id, item.email, item.countryOfResidence);
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
 * /monroo/apis/provider/login:
 *   post:
 *     summary: Authenticate a user with username and password
 *     tags: [Provider]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       description: The login credentials including username and password
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username or email of the user.
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 description: The password of the user.
 *                 example: "userpassword"
 *               fcmToken:
 *                 type: string
 *                 description: The FCM token to be updated for the user (optional).
 *                 example: "fcm_token_example"
 *     responses:
 *       200:
 *         description: Successful login with user details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The unique identifier of the user.
 *                   example: "user_123"
 *                 email:
 *                   type: string
 *                   description: The email of the user.
 *                   example: "user@example.com"
 *                 countryOfResidence:
 *                   type: string
 *                   description: The country of residence of the user.
 *                   example: "USA"
 *                 token:
 *                   type: string
 *                   description: The authentication token for the user.
 *                   example: "auth_token_example"
 *                 status:
 *                   type: number
 *                   description: The status of the login operation.
 *                   example: 200
 *                 fcmToken:
 *                   type: string
 *                   description: The updated FCM token (if provided).
 *                   example: "fcm_token_example"
 *       400:
 *         description: Bad request if username or password is not provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: An error message indicating the issue.
 *       401:
 *         description: Unauthorized if the password does not match.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: An error message indicating wrong password.
 *                   example: "Wrong password"
 *       404:
 *         description: Not Found if the user is not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: An error message indicating the user was not found.
 *                   example: "Cannot find user"
 *       500:
 *         description: Internal server error if an issue occurs during the login process.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: An error message indicating an internal server issue.
 *                   example: "Cannot login [error details]"
 */
router.route("/login").post(myAuth, function (req, res) {
  let username = req.body.username;
  let fcmToken = req.body.fcmToken;
  if (username) {
    Provider.findOne(
      { $or: [{ username: username }, { email: username }] },
      function (err, item) {
        if (item && item.password) {
          let password = req.body.password;
          if (!bcrypt.compareSync(password, item.password)) {
            return returnError(res, "Wrong password");
          }
          let token = getToken(item.id, item.email, item.countryOfResidence);
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
 * /monroo/apis/provider/SocialRegister:
 *   post:
 *     summary: Register a new user with social media details
 *     tags: [Provider]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       description: User details for registration including profile picture
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: string
 *                 description: The user details in JSON format.
 *                 example: '{"email": "user@example.com", "phone": "1234567890", "countryOfResidence": "USA"}'
 *               profilePic:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: The profile picture of the user.
 *     responses:
 *       200:
 *         description: Successful registration with user details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The unique identifier of the user.
 *                   example: "user_123"
 *                 email:
 *                   type: string
 *                   description: The email of the user.
 *                   example: "user@example.com"
 *                 phone:
 *                   type: string
 *                   description: The phone number of the user.
 *                   example: "1234567890"
 *                 profilePic:
 *                   type: string
 *                   description: The URL of the profile picture.
 *                   example: "http://example.com/uploads/profilePic/profilePic.jpg"
 *                 token:
 *                   type: string
 *                   description: The authentication token for the user.
 *                   example: "auth_token_example"
 *                 status:
 *                   type: number
 *                   description: The status of the registration operation.
 *                   example: 200
 *       400:
 *         description: Bad request if user details are missing or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: An error message indicating the issue.
 *       500:
 *         description: Internal server error if an issue occurs during registration.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: An error message indicating an internal server issue.
 *                   example: "Cannot Register [error details]"
 */
router.post(
  "/SocialRegister",
  [uploadAll, myAuth],
  async function (req, res, next) {
    try {
      const DOMAIN = process.env.DOMAIN_ME;
      let body = Provider(JSON.parse(req.body.data));
      const { profilePic } = req.files;
      if (profilePic) {
        for (const item of profilePic) {
          body.profilePic = DOMAIN + "uploads/profilePic/" + item.filename;
        }
      }
      body.id = uuidv4();
      console.log(body);
      if (body) {
        const { id, email, phone } = body;
        let oldUser = await Provider.findOne({
          $or: [{ id: id }, { email: email }, { phone: phone }],
        });
        if (oldUser) {
          return returnError(
            res,
            "This user already registered, duplicate email , username , id or mobile number"
          );
        } else {
          body.password = process.env.SOCIALPASS;
          let encryptedPassword = await bcrypt.hash(body.password, 10);
          body.password = encryptedPassword;
          let token = getToken(body.id, body.email, body.countryOfResidence);
          body.token = token;
          body.save(function (err) {
            if (err) {
              return returnError(res, "Cannot Register " + err);
            } else {
              body.password = "*******";
              return returnData(res, body);
            }
          });
        }
      } else {
        return returnError(res, "Info not detected");
      }
    } catch (error) {
      return returnError(res, "Error " + error);
    }
  }
);

/**
 * @swagger
 * /monroo/apis/provider/EasyRegister:
 *   post:
 *     summary: Register a new provider with optional profile picture
 *     tags: [Provider]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       description: The provider's data including optional profile picture.
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: string
 *                 format: json
 *                 description: JSON string containing provider details.
 *                 example: '{"email": "user@example.com", "phone": "1234567890", "countryOfResidence": "USA"}'
 *               profilePic:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Optional profile picture(s).
 *     responses:
 *       200:
 *         description: Successful registration of a new provider.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Unique identifier of the newly registered provider.
 *                 fname:
 *                   type: string
 *                   description: First name of the provider.
 *                 lname:
 *                   type: string
 *                   description: Last name of the provider.
 *                 email:
 *                   type: string
 *                   description: Email address of the provider.
 *                 phone:
 *                   type: string
 *                   description: Phone number of the provider.
 *                 token:
 *                   type: string
 *                   description: Authentication token for the provider.
 *       400:
 *         description: Bad request, missing or invalid data.
 *       401:
 *         description: Unauthorized, invalid authentication token.
 *       500:
 *         description: Internal server error.
 */
router.post(
  "/EasyRegister",
  [uploadAll, myAuth],
  async function (req, res, next) {
    try {
      const DOMAIN = process.env.DOMAIN_ME;
      let body = Provider(JSON.parse(req.body.data));
      const { profilePic } = req.files;
      if (profilePic) {
        for (const item of profilePic) {
          body.profilePic = DOMAIN + "uploads/profilePic/" + item.filename;
        }
      } else {
        body.profilePic = "";
      }

      body.id = uuidv4();
      console.log(body);
      if (body) {
        const { id, email, phone } = body;
        let oldUser = await Provider.findOne({
          $or: [{ id: id }, { email: email }, { phone: phone }],
        });
        if (oldUser) {
          return returnError(
            res,
            "This user already registered, duplicate email , username , id or mobile number"
          );
        } else {
          let encryptedPassword = await bcrypt.hash(body.password, 10);
          body.password = encryptedPassword;
          let token = getToken(body.id, body.email, body.countryOfResidence);
          body.token = token;
          body.save(function (err) {
            if (err) {
              return returnError(res, "Cannot Register " + err);
            } else {
              body.password = "*******";
              return returnData(res, body);
            }
          });
        }
      } else {
        return returnError(res, "Info not detected");
      }
    } catch (error) {
      return returnError(res, "Error " + error);
    }
  }
);

/**
 * @swagger
 * /monroo/apis/provider/Register:
 *   post:
 *     summary: Register a new provider with various file uploads
 *     tags: [Provider]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       description: Provider's registration data including optional file uploads.
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: string
 *                 format: json
 *                 description: JSON string containing provider details.
 *                 example: '{"email": "user@example.com", "phone": "1234567890", "countryOfResidence": "USA"}'
 *               profilePic:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Optional profile picture(s).
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Optional images for the provider.
 *               videos:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Optional videos for the provider.
 *               audios:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Optional audio files for the provider.
 *               onevideo:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Optional one-minute video.
 *               reel:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Optional demo reel.
 *               resumeCV:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Optional resume or CV.
 *               portfolio:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Optional portfolio link.
 *     responses:
 *       200:
 *         description: Successful registration of a new provider.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Unique identifier of the newly registered provider.
 *                 fname:
 *                   type: string
 *                   description: First name of the provider.
 *                 lname:
 *                   type: string
 *                   description: Last name of the provider.
 *                 email:
 *                   type: string
 *                   description: Email address of the provider.
 *                 phone:
 *                   type: string
 *                   description: Phone number of the provider.
 *                 token:
 *                   type: string
 *                   description: Authentication token for the provider.
 *       400:
 *         description: Bad request, missing or invalid data.
 *       401:
 *         description: Unauthorized, invalid authentication token.
 *       500:
 *         description: Internal server error.
 */
router.post("/Register", uploadAll, async function (req, res, next) {
  try {
    const DOMAIN = process.env.DOMAIN_ME;
    let body = Provider(JSON.parse(req.body.data));
    const { images, videos, audios, onevideo, reel, resumeCV, portfolio } =
      req.files;
    const { profilePic } = req.files;
    if (profilePic) {
      for (const item of profilePic) {
        body.profilePic = DOMAIN + "uploads/profilePic/" + item.filename;
      }
    }
    if (images) {
      let list = [];
      for (const item of images) {
        list.push(DOMAIN + "uploads/images/" + item.filename);
      }
      body.photos = list;
    } else {
      body.photos = [];
    }
    if (videos) {
      let list = [];
      for (const item of videos) {
        list.push(DOMAIN + "uploads/videos/" + item.filename);
      }
      body.videos = list;
    } else {
      body.videos = [];
    }
    if (audios) {
      let list = [];
      for (const item of audios) {
        list.push(DOMAIN + "uploads/audios/" + item.filename);
      }
      body.audios = list;
    } else {
      body.audios = [];
    }
    if (onevideo) {
      let list = [];
      for (const item of onevideo) {
        list.push(DOMAIN + "uploads/onevideo/" + item.filename);
      }
      if (list) body.oneMinuteVideo = list[0];
    } else {
      body.oneMinuteVideo = "";
    }
    if (reel) {
      let list = [];
      for (const item of reel) {
        list.push(DOMAIN + "uploads/reel/" + item.filename);
      }
      if (list) body.demoReel = list[0];
    } else {
      body.demoReel = "";
    }
    if (resumeCV) {
      let list = [];
      for (const item of resumeCV) {
        list.push(DOMAIN + "uploads/resumeCV/" + item.filename);
      }
      if (list) body.resume = list[0];
    } else {
      body.resume = "";
    }
    if (portfolio) {
      let list = [];
      for (const item of portfolio) {
        list.push(DOMAIN + "uploads/portfolio/" + item.filename);
      }
      if (list) body.portfolio = list[0];
    } else {
      body.portfolio = "";
    }
    body.id = uuidv4();
    console.log(body);
    if (body) {
      const { id, email, phone } = body;
      let oldUser = await Provider.findOne({
        $or: [{ id: id }, { email: email }, { phone: phone }],
      });
      if (oldUser) {
        return returnError(
          res,
          "This user already registered, duplicate email , username , id or mobile number"
        );
      } else {
        let encryptedPassword = await bcrypt.hash(body.password, 10);
        body.password = encryptedPassword;
        let token = getToken(body.id, body.email, body.countryOfResidence);
        body.token = token;
        body.save(function (err) {
          if (err) {
            return returnError(res, "Cannot Register " + err);
          } else {
            body.password = "*******";
            return returnData(res, body);
          }
        });
      }
    } else {
      return returnError(res, "Info not detected");
    }
  } catch (error) {
    return returnError(res, "Error " + error);
  }
});

/**
 * @swagger
 * /monroo/apis/provider/GetEvents:
 *   post:
 *     summary: Fetch upcoming events with user details
 *     tags: [Provider]
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Successful retrieval of events
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
 *                   title:
 *                     type: string
 *                     description: Title of the event
 *                   desc:
 *                     type: string
 *                     description: Description of the event
 *                   createdDate:
 *                     type: string
 *                     description: Date when the event was created
 *                   eventDate:
 *                     type: string
 *                     description: Date when the event is scheduled to occur
 *                   eventEndDate:
 *                     type: string
 *                     description: End date of the event
 *                   userID:
 *                     type: string
 *                     description: ID of the user associated with the event
 *                   providerID:
 *                     type: string
 *                     description: ID of the provider associated with the event
 *                   catID:
 *                     type: string
 *                     description: Category ID of the event
 *                   subCatID:
 *                     type: string
 *                     description: Subcategory ID of the event
 *                   location:
 *                     type: string
 *                     description: Location of the event
 *                   languages:
 *                     type: string
 *                     description: Languages relevant to the event
 *                   gender:
 *                     type: integer
 *                     description: Gender preference for the event (0 - Not Specified, 1 - Male, 2 - Female)
 *                   duration:
 *                     type: string
 *                     description: Duration of the event
 *                   averageCost:
 *                     type: string
 *                     description: Average cost for attending the event
 *                   country:
 *                     type: string
 *                     description: Country where the event is held
 *                   dealCost:
 *                     type: string
 *                     description: Deal cost for the event
 *                   status:
 *                     type: integer
 *                     description: Status of the event (0 - Pending, 1 - Booked, 2 - Purchased & Done, 3 - Purchased (Authorized), 4 - Canceled)
 *                   userName:
 *                     type: string
 *                     description: Name of the user associated with the event
 *                   profilePic:
 *                     type: string
 *                     description: Profile picture URL of the user associated with the event
 *       401:
 *         description: Unauthorized access, invalid authentication token
 *       500:
 *         description: Internal server error
 */
router.post("/GetEvents", auth, async function (req, res) {
  try {
    // Event.find({},function(err , items){
    //     if(err){
    //         return returnError(res, "Failed"+err);
    //     }else {
    //         return returnData(res, items);
    //     }
    // });
    // Use aggregate to perform a lookup between two models
    let currentDate = Date.now().toString();
    console.log(currentDate);
    Event.aggregate([
      {
        $match: {
          $or: [{ status: 0 }, { status: 4 }],
          eventDate: { $gt: currentDate }, // Current date and time
        },
      },
      {
        $lookup: {
          from: "users", // name as mongo named it with s at last
          localField: "userID",
          foreignField: "id",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          normalizedEventDate: {
            $cond: {
              if: { $eq: ["$eventDate", ""] }, // Check if createdDate is an empty string
              then: null, // Set to null if empty
              else: {
                $cond: {
                  if: { $regexMatch: { input: "$eventDate", regex: /^\d+$/ } }, // Check if createdDate is a number string (Unix timestamp)
                  then: { $toDate: { $toLong: "$eventDate" } }, // Convert Unix timestamp string to JavaScript Date
                  else: {
                    $cond: {
                      if: {
                        $regexMatch: {
                          input: "$eventDate",
                          regex: /^\d{2}-\d{2}-\d{4}$/,
                        },
                      }, // Check if createdDate is in 'dd-MM-yyyy' format
                      then: {
                        $dateFromString: {
                          dateString: "$eventDate",
                          format: "%d-%m-%Y",
                        },
                      }, // Convert 'dd-MM-yyyy' string to JavaScript Date
                      else: { $toDate: "$eventDate" }, // Assume it's an ISO date string and convert to JavaScript Date
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $project: {
          id: 1,
          title: 1,
          desc: 1,
          createdDate: 1,
          eventDate: 1,
          eventEndDate: 1,
          userID: 1,
          providerID: 1,
          catID: 1,
          subCatID: 1,
          duration: 1,
          gender: 1,
          averageCost: 1,
          country: 1,
          dealCost: 1,
          status: 1,
          userName: "$userDetails.name",
          profilePic: "$userDetails.profilePic",
        },
      },
      {
        $sort: {
          normalizedEventDate: 1, // Sort by eventDate in descending order
        },
      },
    ]).exec((err, results) => {
      if (err) {
        console.error(err);
        return returnError(res, "Failed" + err);
      }
      // console.log(results);
      return returnData(res, results);
    });
  } catch (err) {
    return returnError(res, "Failed" + err);
  }
});

/**
 * @swagger
 * /monroo/apis/provider/GetOneEvent:
 *   post:
 *     summary: Fetch details of a single event
 *     tags: [Provider]
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
 *                 description: Unique identifier of the event to retrieve
 *               userID:
 *                 type: string
 *                 description: Unique identifier of the user requesting the event details
 *             required:
 *               - eventID
 *               - userID
 *     responses:
 *       200:
 *         description: Successful retrieval of event details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Unique identifier of the event
 *                 title:
 *                   type: string
 *                   description: Title of the event
 *                 desc:
 *                   type: string
 *                   description: Description of the event
 *                 createdDate:
 *                   type: string
 *                   description: Date when the event was created
 *                 eventDate:
 *                   type: string
 *                   description: Date when the event is scheduled to occur
 *                 eventEndDate:
 *                   type: string
 *                   description: End date of the event
 *                 userID:
 *                   type: string
 *                   description: ID of the user associated with the event
 *                 providerID:
 *                   type: string
 *                   description: ID of the provider associated with the event
 *                 catID:
 *                   type: string
 *                   description: Category ID of the event
 *                 subCatID:
 *                   type: string
 *                   description: Subcategory ID of the event
 *                 location:
 *                   type: string
 *                   description: Location of the event
 *                 languages:
 *                   type: string
 *                   description: Languages relevant to the event
 *                 gender:
 *                   type: integer
 *                   description: Gender preference for the event (0 - Not Specified, 1 - Male, 2 - Female)
 *                 duration:
 *                   type: string
 *                   description: Duration of the event
 *                 averageCost:
 *                   type: string
 *                   description: Average cost for attending the event
 *                 country:
 *                   type: string
 *                   description: Country where the event is held
 *                 dealCost:
 *                   type: string
 *                   description: Deal cost for the event
 *                 status:
 *                   type: integer
 *                   description: Status of the event (0 - Pending, 1 - Booked, 2 - Purchased & Done, 3 - Purchased (Authorized), 4 - Canceled)
 *                 userName:
 *                   type: string
 *                   description: Name of the user associated with the event
 *       400:
 *         description: Bad request, missing or invalid parameters
 *       401:
 *         description: Unauthorized access, invalid authentication token
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
router.post("/GetOneEvent", auth, async function (req, res) {
  try {
    var eventID = req.body.eventID;
    var userID = req.body.userID;
    Event.findOne({ id: eventID }, async function (err, item) {
      if (err) {
        return returnError(res, "Failed" + err);
      } else {
        if (item) {
          var user = await User.findOne({ id: userID });
          item.userName = user.name;
          return returnData(res, item);
        }
      }
    }).lean();
  } catch (err) {
    return returnError(res, "Failed" + err);
  }
});

/**
 * @swagger
 * /monroo/apis/provider/getSharedEvent:
 *   post:
 *     summary: Retrieve a shared event by its ID
 *     tags: [Provider]
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
 *                 description: Unique identifier of the event to retrieve
 *             required:
 *               - eventID
 *     responses:
 *       200:
 *         description: Successfully retrieved the event details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Unique identifier of the event
 *                 title:
 *                   type: string
 *                   description: Title of the event
 *                 desc:
 *                   type: string
 *                   description: Description of the event
 *                 createdDate:
 *                   type: string
 *                   description: Date when the event was created
 *                 eventDate:
 *                   type: string
 *                   description: Date when the event is scheduled to occur
 *                 eventEndDate:
 *                   type: string
 *                   description: End date of the event
 *                 userID:
 *                   type: string
 *                   description: ID of the user associated with the event
 *                 providerID:
 *                   type: string
 *                   description: ID of the provider associated with the event
 *                 catID:
 *                   type: string
 *                   description: Category ID of the event
 *                 subCatID:
 *                   type: string
 *                   description: Subcategory ID of the event
 *                 location:
 *                   type: string
 *                   description: Location of the event
 *                 languages:
 *                   type: string
 *                   description: Languages relevant to the event
 *                 gender:
 *                   type: integer
 *                   description: Gender preference for the event (0 - Not Specified, 1 - Male, 2 - Female)
 *                 duration:
 *                   type: string
 *                   description: Duration of the event
 *                 averageCost:
 *                   type: string
 *                   description: Average cost for attending the event
 *                 country:
 *                   type: string
 *                   description: Country where the event is held
 *                 dealCost:
 *                   type: string
 *                   description: Deal cost for the event
 *                 status:
 *                   type: integer
 *                   description: Status of the event (0 - Pending, 1 - Booked, 2 - Purchased & Done, 3 - Purchased (Authorized), 4 - Canceled)
 *                 userName:
 *                   type: string
 *                   description: Name of the user associated with the event
 *       400:
 *         description: Bad request, missing or invalid parameters
 *       401:
 *         description: Unauthorized access, invalid authentication token
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
router.post("/getSharedEvent", myAuth, async function (req, res) {
  try {
    var eventID = req.body.eventID;
    Event.findOne({ id: eventID }, async function (err, item) {
      if (err) {
        return returnError(res, "Failed" + err);
      } else {
        if (item) {
          var user = await User.findOne({ id: item.userID });
          item.userName = user.name;
          return returnData(res, item);
        }
      }
    }).lean();
  } catch (err) {
    return returnError(res, "Failed" + err);
  }
});

/**
 * @swagger
 * /monroo/apis/provider/getMessagesProfiles:
 *   post:
 *     summary: Retrieve profiles of users who have sent messages to the authenticated user
 *     tags: [Provider]
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Successfully retrieved profiles of users who sent messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   messageID:
 *                     type: string
 *                     description: Unique identifier of the message
 *                   senderID:
 *                     type: string
 *                     description: ID of the user who sent the message
 *                   senderName:
 *                     type: string
 *                     description: Name of the user who sent the message
 *                   senderPhoto:
 *                     type: string
 *                     description: URL of the profile picture of the user who sent the message
 *                   msgDate:
 *                     type: string
 *                     description: Date when the message was sent
 *       401:
 *         description: Unauthorized access, invalid authentication token
 *       500:
 *         description: Internal server error
 */
router.post("/getMessagesProfiles", auth, function (req, res) {
  try {
    const userID = req.user.userID;
    Message.find({ providerID: userID }, async function (err, items) {
      if (err) {
        returnError(res, err);
      } else {
        const ids = items.map(({ userID }) => userID);
        const filtered = items.filter(
          ({ userID }, index) => !ids.includes(userID, index + 1)
        );
        var response = [];
        for (const item of filtered) {
          const sender = await User.findOne({ id: item.userID });
          if (!sender) continue;
          var data = {};
          data.messageID = item.id;
          data.senderID = item.userID;
          data.senderName = sender.name;
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
 * /monroo/apis/provider/getDetailedMessages:
 *   post:
 *     summary: Retrieve detailed messages between the authenticated user and a specific employer, including event details if applicable
 *     tags: [Provider]
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
 *                 description: ID of the employer whose messages are being retrieved
 *                 example: "605c72ef1b4e8e3f4e4d8c0b"
 *             required:
 *               - userID
 *     responses:
 *       200:
 *         description: Successfully retrieved detailed messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Unique identifier of the message
 *                     example: "605c72ef1b4e8e3f4e4d8c0c"
 *                   msg:
 *                     type: string
 *                     description: Content of the message
 *                     example: "Looking forward to your response."
 *                   type:
 *                     type: number
 *                     description: Type of the message (1 - Request Event, 2 - Normal Message, etc.)
 *                     example: 1
 *                   providerID:
 *                     type: string
 *                     description: ID of the provider (authenticated user)
 *                     example: "605c72ef1b4e8e3f4e4d8c0a"
 *                   userID:
 *                     type: string
 *                     description: ID of the user (employer)
 *                     example: "605c72ef1b4e8e3f4e4d8c0b"
 *                   senderID:
 *                     type: string
 *                     description: ID of the sender
 *                     example: "605c72ef1b4e8e3f4e4d8c0d"
 *                   eventID:
 *                     type: string
 *                     description: ID of the associated event
 *                     example: "605c72ef1b4e8e3f4e4d8c0e"
 *                   msgDate:
 *                     type: string
 *                     description: Date and time when the message was sent
 *                     example: "2024-08-24T12:34:56Z"
 *                   eventObj:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Unique identifier of the event
 *                         example: "605c72ef1b4e8e3f4e4d8c0e"
 *                       title:
 *                         type: string
 *                         description: Title of the event
 *                         example: "Job Fair"
 *                       desc:
 *                         type: string
 *                         description: Description of the event
 *                         example: "A job fair for new opportunities."
 *                       createdDate:
 *                         type: string
 *                         description: Date when the event was created
 *                         example: "2024-08-01T00:00:00Z"
 *                       eventDate:
 *                         type: string
 *                         description: Date when the event is scheduled to occur
 *                         example: "2024-08-30T00:00:00Z"
 *                       eventEndDate:
 *                         type: string
 *                         description: End date of the event
 *                         example: "2024-08-31T00:00:00Z"
 *                       userID:
 *                         type: string
 *                         description: ID of the user who created the event
 *                         example: "605c72ef1b4e8e3f4e4d8c0b"
 *                       providerID:
 *                         type: string
 *                         description: ID of the provider associated with the event
 *                         example: "605c72ef1b4e8e3f4e4d8c0a"
 *                       catID:
 *                         type: string
 *                         description: Category ID of the event
 *                         example: "605c72ef1b4e8e3f4e4d8c0f"
 *                       subCatID:
 *                         type: string
 *                         description: Subcategory ID of the event
 *                         example: "605c72ef1b4e8e3f4e4d8c10"
 *                       location:
 *                         type: string
 *                         description: Location of the event
 *                         example: "Convention Center"
 *                       languages:
 *                         type: string
 *                         description: Languages spoken at the event
 *                         example: "English, Spanish"
 *                       gender:
 *                         type: number
 *                         description: Gender preference for the event (0 - not specified, 1 - male, 2 - female)
 *                         example: 1
 *                       duration:
 *                         type: string
 *                         description: Duration of the event
 *                         example: "2 hours"
 *                       averageCost:
 *                         type: string
 *                         description: Average cost associated with the event
 *                         example: "$100"
 *                       country:
 *                         type: string
 *                         description: Country where the event is held
 *                         example: "USA"
 *                       dealCost:
 *                         type: string
 *                         description: Deal cost of the event
 *                         example: "$80"
 *                       status:
 *                         type: number
 *                         description: Status of the event (0 - Pending, 1 - Booked, etc.)
 *                         example: 0
 *       400:
 *         description: Bad request, invalid input data
 *       401:
 *         description: Unauthorized access, invalid authentication token
 *       500:
 *         description: Internal server error
 */
router.post("/getDetailedMessages", auth, async function (req, res) {
  try {
    const userID = req.user.userID;
    const employer = req.body.userID;
    Message.find(
      { providerID: userID, userID: employer },
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
 * /monroo/apis/provider/sendMessage:
 *   post:
 *     summary: Send a new message from the authenticated user to another user
 *     tags: [Provider]
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
 *                 description: ID of the recipient user
 *                 example: "605c72ef1b4e8e3f4e4d8c0b"
 *               msg:
 *                 type: string
 *                 description: Content of the message
 *                 example: "Hello, I would like to discuss the job opportunity."
 *               type:
 *                 type: number
 *                 description: Type of the message (1 - Request Event, 2 - Normal Message, etc.)
 *                 example: 2
 *               eventID:
 *                 type: string
 *                 description: ID of the associated event (optional)
 *                 example: "605c72ef1b4e8e3f4e4d8c0e"
 *             required:
 *               - userID
 *               - msg
 *     responses:
 *       200:
 *         description: Message successfully sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Unique identifier of the message
 *                   example: "a3f5e4d7-1f4a-42b9-85f4-7c3b0d0c1d2b"
 *                 userID:
 *                   type: string
 *                   description: ID of the recipient user
 *                   example: "605c72ef1b4e8e3f4e4d8c0b"
 *                 msg:
 *                   type: string
 *                   description: Content of the message
 *                   example: "Hello, I would like to discuss the job opportunity."
 *                 type:
 *                   type: number
 *                   description: Type of the message
 *                   example: 2
 *                 providerID:
 *                   type: string
 *                   description: ID of the provider (authenticated user)
 *                   example: "605c72ef1b4e8e3f4e4d8c0a"
 *                 senderID:
 *                   type: string
 *                   description: ID of the sender
 *                   example: "605c72ef1b4e8e3f4e4d8c0a"
 *                 eventID:
 *                   type: string
 *                   description: ID of the associated event (optional)
 *                   example: "605c72ef1b4e8e3f4e4d8c0e"
 *                 msgDate:
 *                   type: string
 *                   description: Date and time when the message was sent
 *                   example: "2024-08-24T12:34:56Z"
 *       400:
 *         description: Bad request, invalid input data
 *       401:
 *         description: Unauthorized access, invalid authentication token
 *       500:
 *         description: Internal server error
 */
router.post("/sendMessage", auth, async function (req, res) {
  try {
    const message = Message(req.body);
    if (message) {
      const currentTimestampInMilliseconds = new Date().getTime();
      message.id = crypto.randomUUID();
      message.providerID = req.user.userID;
      message.senderID = req.user.userID;
      message.msgDate = currentTimestampInMilliseconds;
      message.save(function (err) {
        if (err) {
          return returnError(res, "Failed" + err);
        } else {
          sendNotification(
            message.userID,
            "New Message",
            "You have new message",
            "PROV_Message"
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
 * /monroo/apis/provider/getBookings:
 *   post:
 *     summary: Retrieve bookings for the authenticated provider
 *     tags: [Provider]
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Successfully retrieved bookings
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
 *                     example: "605c72ef1b4e8e3f4e4d8c0b"
 *                   title:
 *                     type: string
 *                     description: Title of the event
 *                     example: "Job Interview"
 *                   desc:
 *                     type: string
 *                     description: Description of the event
 *                     example: "Interview for the senior developer position."
 *                   createdDate:
 *                     type: string
 *                     description: Date when the event was created
 *                     example: "2024-08-24T12:34:56Z"
 *                   eventDate:
 *                     type: string
 *                     description: Date of the event
 *                     example: "2024-09-15T09:00:00Z"
 *                   eventEndDate:
 *                     type: string
 *                     description: End date of the event
 *                     example: "2024-09-15T17:00:00Z"
 *                   providerID:
 *                     type: string
 *                     description: ID of the provider
 *                     example: "605c72ef1b4e8e3f4e4d8c0a"
 *                   userID:
 *                     type: string
 *                     description: ID of the user associated with the event
 *                     example: "605c72ef1b4e8e3f4e4d8c0b"
 *                   catID:
 *                     type: string
 *                     description: ID of the category
 *                     example: "605c72ef1b4e8e3f4e4d8c0c"
 *                   subCatID:
 *                     type: string
 *                     description: ID of the subcategory
 *                     example: "605c72ef1b4e8e3f4e4d8c0d"
 *                   location:
 *                     type: string
 *                     description: Location of the event
 *                     example: "New York City"
 *                   languages:
 *                     type: string
 *                     description: Languages spoken during the event
 *                     example: "English"
 *                   gender:
 *                     type: number
 *                     description: Gender preference for the event
 *                     example: 1 # 1 - Male
 *                   duration:
 *                     type: string
 *                     description: Duration of the event
 *                     example: "2 hours"
 *                   averageCost:
 *                     type: string
 *                     description: Average cost of the event
 *                     example: "$200"
 *                   country:
 *                     type: string
 *                     description: Country where the event is held
 *                     example: "USA"
 *                   dealCost:
 *                     type: string
 *                     description: Deal cost of the event
 *                     example: "$150"
 *                   status:
 *                     type: number
 *                     description: Status of the event (0 = Pending, 1 = Booked, etc.)
 *                     example: 1
 *       400:
 *         description: Bad request, invalid parameters or data
 *       401:
 *         description: Unauthorized access, invalid authentication token
 *       500:
 *         description: Internal server error
 */
router.post("/getBookings", auth, async function (req, res) {
  try {
    const currentTimestampInMilliseconds = new Date().getTime();
    const providerID = req.user.userID;
    Event.find(
      { providerID: providerID, status: { $ne: 4 } },
      async function (err, items) {
        if (err) {
          returnError(res, err);
        } else {
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
 * /monroo/apis/provider/GetReviews:
 *   post:
 *     summary: Retrieve reviews for a provider from a specific user
 *     tags: [Provider]
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
 *                 description: The ID of the user whose reviews are being requested
 *                 example: "605c72ef1b4e8e3f4e4d8c0b"
 *     responses:
 *       200:
 *         description: Successfully retrieved reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Unique identifier of the review
 *                     example: "605c72ef1b4e8e3f4e4d8c0a"
 *                   userID:
 *                     type: string
 *                     description: ID of the user who wrote the review
 *                     example: "605c72ef1b4e8e3f4e4d8c0b"
 *                   providerID:
 *                     type: string
 *                     description: ID of the provider being reviewed
 *                     example: "605c72ef1b4e8e3f4e4d8c0c"
 *                   stars:
 *                     type: number
 *                     description: Rating given in the review (1-5 stars)
 *                     example: 4
 *                   comment:
 *                     type: string
 *                     description: Text of the review comment
 *                     example: "Great service, would recommend!"
 *                   isProvider:
 *                     type: boolean
 *                     description: Indicates if the review was made by a provider
 *                     example: false
 *       400:
 *         description: Bad request, invalid parameters or data
 *       401:
 *         description: Unauthorized access, invalid authentication token
 *       500:
 *         description: Internal server error
 */
router.post("/GetReviews", auth, function (req, res) {
  try {
    const providerID = req.user.userID;
    const userID = req.body.userID;
    Reviews.find(
      { userID: userID, providerID: providerID },
      function (err, items) {
        if (err) {
          return returnError(res, "Failed" + err);
        } else {
          return returnData(res, items);
        }
      }
    );
  } catch (err) {
    return returnError(res, "Failed" + err);
  }
});

/**
 * @swagger
 * /monroo/apis/provider/GetMyReviews:
 *   post:
 *     summary: Retrieve reviews for the authenticated provider
 *     description: Fetches reviews where the authenticated provider is being reviewed by users (not other providers).
 *     tags: [Provider]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Unique identifier of the review
 *                     example: "605c72ef1b4e8e3f4e4d8c0a"
 *                   userID:
 *                     type: string
 *                     description: ID of the user who wrote the review
 *                     example: "605c72ef1b4e8e3f4e4d8c0b"
 *                   providerID:
 *                     type: string
 *                     description: ID of the provider being reviewed
 *                     example: "605c72ef1b4e8e3f4e4d8c0c"
 *                   stars:
 *                     type: number
 *                     description: Rating given in the review (1-5 stars)
 *                     example: 4
 *                   comment:
 *                     type: string
 *                     description: Text of the review comment
 *                     example: "Great service, would recommend!"
 *                   isProvider:
 *                     type: boolean
 *                     description: Indicates if the reviewer is a provider
 *                     example: false
 *       400:
 *         description: Bad request, invalid parameters or data
 *       401:
 *         description: Unauthorized access, invalid authentication token
 *       500:
 *         description: Internal server error
 */
router.post("/GetMyReviews", auth, function (req, res) {
  try {
    const providerID = req.user.userID;
    Reviews.find(
      { providerID: providerID, isProvider: false },
      function (err, items) {
        if (err) {
          return returnError(res, "Failed" + err);
        } else {
          return returnData(res, items);
        }
      }
    );
  } catch (err) {
    return returnError(res, "Failed" + err);
  }
});

/**
 * @swagger
 * /monroo/apis/provider/AddReview:
 *   post:
 *     summary: Add a review for a provider
 *     description: Allows a provider to add a review for themselves. Checks if a review from the same user already exists before saving.
 *     tags: [Provider]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userID:
 *                 type: string
 *                 description: ID of the user who is being reviewed
 *                 example: "605c72ef1b4e8e3f4e4d8c0b"
 *               stars:
 *                 type: number
 *                 description: Rating given in the review (1-5 stars)
 *                 example: 5
 *               comment:
 *                 type: string
 *                 description: Text of the review comment
 *                 example: "Excellent service, highly recommended!"
 *     responses:
 *       200:
 *         description: Successfully added the review
 *         content:
 *           application/json:
 *             schema:
 *               type: boolean
 *               example: true
 *       400:
 *         description: Bad request, invalid parameters or data
 *       401:
 *         description: Unauthorized access, invalid authentication token
 *       403:
 *         description: Forbidden, review from the same user already exists
 *       500:
 *         description: Internal server error
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.post("/AddReview", auth, async function (req, res) {
  try {
    const review = new Reviews(req.body);
    const providerID = req.user.userID;
    review.providerID = providerID;
    review.isProvider = true;
    var oldReview = await Reviews.findOne({
      userID: review.userID,
      providerID: providerID,
      isProvider: true,
    });
    if (oldReview) {
      return returnError(res, "Aready Rated!");
    }
    review.id = crypto.randomUUID();
    review.save(function (err) {
      if (err) {
        return returnError(res, "Failed" + err);
      } else {
        return returnData(res, true);
      }
    });
  } catch (err) {
    return returnError(res, "Failed" + err);
  }
});

/**
 * @swagger
 * /monroo/apis/provider/getAllProvider:
 *   post:
 *     summary: Retrieve a list of all providers
 *     description: Fetches a list of all providers from the database.
 *     tags: [Provider]
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of providers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Unique identifier of the provider
 *                     example: "605c72ef1b4e8e3f4e4d8c0a"
 *                   catID:
 *                     type: string
 *                     description: Category ID associated with the provider
 *                     example: "605c72ef1b4e8e3f4e4d8c1b"
 *                   subCatID:
 *                     type: array
 *                     items:
 *                       type: object
 *                       description: Sub-category IDs associated with the provider
 *                   profilePic:
 *                     type: string
 *                     description: URL of the provider's profile picture
 *                     example: "http://example.com/uploads/profilePic/profilePic.jpg"
 *                   fname:
 *                     type: string
 *                     description: First name of the provider
 *                     example: "John"
 *                   lname:
 *                     type: string
 *                     description: Last name of the provider
 *                     example: "Doe"
 *                   gender:
 *                     type: number
 *                     example: 1
 *                   isActive:
 *                     type: boolean
 *                     description: Indicates if the provider is active
 *                     example: true
 *                   username:
 *                     type: string
 *                     description: Username of the provider
 *                     example: "johndoe"
 *                   password:
 *                     type: string
 *                     description: Password of the provider (hashed)
 *                     example: "******"
 *                   registerDate:
 *                     type: string
 *                     description: Registration date of the provider
 *                     example: "2024-01-01"
 *                   phone:
 *                     type: string
 *                     description: Phone number of the provider
 *                     example: "+1234567890"
 *                   email:
 *                     type: string
 *                     description: Email address of the provider
 *                     example: "provider@example.com"
 *                   dob:
 *                     type: string
 *                     description: Date of birth of the provider
 *                     example: "1990-01-01"
 *                   nationality:
 *                     type: string
 *                     description: Nationality of the provider
 *                     example: "American"
 *                   education:
 *                     type: string
 *                     description: Education background of the provider
 *                     example: "Bachelor's in Engineering"
 *                   averageRatePerHour:
 *                     type: string
 *                     description: Average rate per hour charged by the provider
 *                     example: "50"
 *                   openToWorkInCountry:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: List of countries the provider is open to work in
 *                   countryOfResidence:
 *                     type: string
 *                     description: Country of residence of the provider
 *                     example: "USA"
 *                   spokenLanguage:
 *                     type: string
 *                     description: Languages spoken by the provider
 *                     example: "English, Spanish"
 *                   experience:
 *                     type: string
 *                     description: Work experience of the provider
 *                     example: "5 years in software development"
 *                   visaType:
 *                     type: number
 *                     description: Type of visa held by the provider
 *                     example: 1
 *                   instagram:
 *                     type: string
 *                     description: Instagram profile URL of the provider
 *                     example: "http://instagram.com/johndoe"
 *                   photos:
 *                     type: array
 *                     items:
 *                       type: string
 *                       format: uri
 *                     description: URLs of additional images of the provider
 *                   introductionVideoLink:
 *                     type: string
 *                     description: URL of the introduction video
 *                     example: "http://example.com/videos/intro.mp4"
 *                   youtubelink:
 *                     type: string
 *                     description: YouTube channel link of the provider
 *                     example: "http://youtube.com/johndoe"
 *                   videos:
 *                     type: array
 *                     items:
 *                       type: string
 *                       format: uri
 *                     description: URLs of videos related to the provider
 *                   bio:
 *                     type: string
 *                     description: Short biography of the provider (200 words max)
 *                     example: "Experienced software developer with a passion for coding."
 *                   workLink:
 *                     type: string
 *                     description: URL to the provider's work or portfolio
 *                     example: "http://example.com/work"
 *                   linkedin:
 *                     type: string
 *                     description: LinkedIn profile URL of the provider
 *                     example: "http://linkedin.com/in/johndoe"
 *                   height:
 *                     type: string
 *                     description: Height of the provider
 *                     example: "6 feet"
 *                   weight:
 *                     type: string
 *                     description: Weight of the provider
 *                     example: "70 kg"
 *                   resume:
 *                     type: string
 *                     description: URL of the resume/CV
 *                     example: "http://example.com/resume.pdf"
 *                   portfolio:
 *                     type: string
 *                     description: URL of the portfolio document
 *                     example: "http://example.com/portfolio.pdf"
 *                   isAmodel:
 *                     type: boolean
 *                     description: Indicates if the provider is a model
 *                     example: true
 *                   oneMinuteVideo:
 *                     type: string
 *                     description: URL of the one-minute video
 *                     example: "http://example.com/videos/oneMinute.mp4"
 *                   audios:
 *                     type: array
 *                     items:
 *                       type: string
 *                       format: uri
 *                     description: URLs of audio files related to the provider
 *                   musicalInstruments:
 *                     type: array
 *                     items:
 *                       type: number
 *                     description: List of musical instruments associated with the provider
 *                   musicGenres:
 *                     type: array
 *                     items:
 *                       type: number
 *                     description: List of music genres associated with the provider
 *                   specialSkills:
 *                     type: string
 *                     description: Special skills of the provider
 *                     example: "Expert in JavaScript and Node.js"
 *                   demoReel:
 *                     type: string
 *                     description: URL of the demo reel
 *                     example: "http://example.com/videos/demoReel.mp4"
 *                   token:
 *                     type: string
 *                     description: Token for additional functionalities
 *                     example: "abcdef123456"
 *                   fcmToken:
 *                     type: string
 *                     description: Firebase Cloud Messaging token
 *                     example: "fcmToken123456"
 *       500:
 *         description: Internal server error
 */
router.post("/getAllProvider", function (req, res) {
  Provider.find({}, function (err, items) {
    returnData(res, items);
  });
});

/**
 * @swagger
 * /monroo/apis/provider/checkAuth:
 *   post:
 *     summary: Check authentication and validate user token
 *     description: Validates the provided JWT token and retrieves the associated user details. If the token is expired, a new token is generated and returned.
 *     tags: [Provider]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               x-access-token:
 *                 type: string
 *                 description: The JWT token to be validated
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Successfully validated the token and retrieved user details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Unique identifier of the provider
 *                   example: "605c72ef1b4e8e3f4e4d8c0a"
 *                 catID:
 *                   type: string
 *                   description: Category ID associated with the provider
 *                   example: "605c72ef1b4e8e3f4e4d8c1b"
 *                 profilePic:
 *                   type: string
 *                   description: URL of the provider's profile picture
 *                   example: "http://example.com/uploads/profilePic/profilePic.jpg"
 *                 fname:
 *                   type: string
 *                   description: First name of the provider
 *                   example: "John"
 *                 lname:
 *                   type: string
 *                   description: Last name of the provider
 *                   example: "Doe"
 *                 gender:
 *                   type: number
 *                   example: 1
 *                 isActive:
 *                   type: boolean
 *                   description: Indicates if the provider is active
 *                   example: true
 *                 username:
 *                   type: string
 *                   description: Username of the provider
 *                   example: "johndoe"
 *                 email:
 *                   type: string
 *                   description: Email address of the provider
 *                   example: "provider@example.com"
 *                 country:
 *                   type: string
 *                   description: Country of residence of the provider
 *                   example: "USA"
 *                 token:
 *                   type: string
 *                   description: Newly generated JWT token if the old one was expired
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Bad request, token not sent or invalid
 *       401:
 *         description: Unauthorized, token is not valid
 *       404:
 *         description: User not found
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
      var provider = await Provider.findOne({ id: userID });
      if (!provider) {
        return returnError(res, "User Not Found");
      }
      return returnData(res, provider);
    } catch (err) {
      try {
        if (err.name === "TokenExpiredError") {
          const payload = jwt.verify(tokenMe, config.JWT_KEY, {
            ignoreExpiration: true,
          });
          var userID = payload.userID;
          var provider = await Provider.findOne({ id: userID });
          var email = provider.email;
          var country = provider.country;
          let token = jwt.sign(
            { userID: userID, email: email, country: country },
            process.env.JWT_KEY,
            {
              expiresIn: "24h",
            }
          );
          provider.token = token;
          await provider.save();
          return returnData(res, provider);
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
 * /monroo/apis/provider/UpdateProvider:
 *   post:
 *     summary: Update provider profile information
 *     description: Allows a provider to update their profile information including images, videos, audios, and other media files. Validates and updates provider details if the provider exists.
 *     tags: [Provider]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: string
 *                 description: JSON string containing provider details (excluding media files)
 *                 example: '{"email": "provider@example.com", "phone": "+1234567890", "profilePic": "profilePic.jpg", "images": ["image1.jpg", "image2.jpg"], "videos": ["video1.mp4"], "audios": ["audio1.mp3"], "onevideo": ["onevideo.mp4"], "reel": ["reel.mp4"], "resumeCV": ["resume.pdf"], "portfolio": ["portfolio.pdf"]}'
 *               profilePic:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Profile picture of the provider
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Additional images of the provider
 *               videos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Videos related to the provider
 *               audios:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Audio files related to the provider
 *               onevideo:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: One-minute video of the provider
 *               reel:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Demo reel of the provider
 *               resumeCV:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Resume/CV of the provider
 *               portfolio:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Portfolio documents of the provider
 *     responses:
 *       200:
 *         description: Successfully updated provider profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Unique identifier of the provider
 *                 email:
 *                   type: string
 *                   description: Email address of the provider
 *                 phone:
 *                   type: string
 *                   description: Phone number of the provider
 *                 profilePic:
 *                   type: string
 *                   description: URL of the provider's profile picture
 *                 photos:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: URLs of the additional images
 *                 videos:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: URLs of the videos
 *                 audios:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: URLs of the audio files
 *                 oneMinuteVideo:
 *                   type: string
 *                   description: URL of the one-minute video
 *                 demoReel:
 *                   type: string
 *                   description: URL of the demo reel
 *                 resume:
 *                   type: string
 *                   description: URL of the resume/CV
 *                 portfolio:
 *                   type: string
 *                   description: URL of the portfolio document
 *       400:
 *         description: Bad request, invalid parameters or data
 *       401:
 *         description: Unauthorized access, invalid authentication token
 *       403:
 *         description: Forbidden, user not found or invalid request
 *       500:
 *         description: Internal server error
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.post(
  "/UpdateProvider",
  [auth, uploadAll],
  async function (req, res, next) {
    try {
      const DOMAIN = process.env.DOMAIN_ME;
      let body = Provider(JSON.parse(req.body.data));
      const { images, videos, audios, onevideo, reel, resumeCV, portfolio } =
        req.files;
      const { profilePic } = req.files;
      if (profilePic) {
        for (const item of profilePic) {
          body.profilePic = DOMAIN + "uploads/profilePic/" + item.filename;
        }
      }
      if (images) {
        let list = [];
        for (const item of images) {
          list.push(DOMAIN + "uploads/images/" + item.filename);
        }
        body.photos = list;
      } else {
        body.photos = [];
      }
      if (videos) {
        let list = [];
        for (const item of videos) {
          list.push(DOMAIN + "uploads/videos/" + item.filename);
        }
        body.videos = list;
      } else {
        body.videos = [];
      }
      if (audios) {
        let list = [];
        for (const item of audios) {
          list.push(DOMAIN + "uploads/audios/" + item.filename);
        }
        body.audios = list;
      } else {
        body.audios = [];
      }
      if (onevideo) {
        let list = [];
        for (const item of onevideo) {
          list.push(DOMAIN + "uploads/onevideo/" + item.filename);
        }
        if (list) body.oneMinuteVideo = list[0];
      } else {
        body.oneMinuteVideo = "";
      }
      if (reel) {
        let list = [];
        for (const item of reel) {
          list.push(DOMAIN + "uploads/reel/" + item.filename);
        }
        if (list) body.demoReel = list[0];
      } else {
        body.demoReel = "";
      }
      if (resumeCV) {
        let list = [];
        for (const item of resumeCV) {
          list.push(DOMAIN + "uploads/resumeCV/" + item.filename);
        }
        if (list) body.resume = list[0];
      } else {
        body.resume = "";
      }
      if (portfolio) {
        let list = [];
        for (const item of portfolio) {
          list.push(DOMAIN + "uploads/portfolio/" + item.filename);
        }
        if (list) body.portfolio = list[0];
      } else {
        body.portfolio = "";
      }
      body.id = uuidv4();
      console.log(body);
      if (body) {
        const { id, email, phone } = body;
        let oldUser = await Provider.findOne({
          $or: [{ id: id }, { email: email }, { phone: phone }],
        });
        if (oldUser) {
          body.email = oldUser.email;
          body.id = oldUser.id;
          body._id = oldUser._id;
          body._v = oldUser._v;
          // let password = body.password;
          // if (!bcrypt.compareSync(password, oldUser.password)){
          //     return returnError(res , "Wrong password");
          // }
          // let encryptedPassword = await bcrypt.hash(body.password, 10);
          body.password = oldUser.password;
          const doc = await Provider.findOneAndUpdate(
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
        } else {
          return returnError(res, "User not found");
        }
      } else {
        return returnError(res, "Info not detected");
      }
    } catch (error) {
      return returnError(res, "Error " + error);
    }
  }
);

/**
 * @swagger
 * /monroo/apis/provider/RequestConnection:
 *   post:
 *     summary: Request a connection with a user for a specific event
 *     description: Sends a connection request to a user for a given event. If a connection request for the same event has already been sent, returns an error.
 *     tags: [Provider]
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
 *                 description: The ID of the event for which the connection request is made
 *                 example: "605c72ef1b4e8e3f4e4d8c0b"
 *               userID:
 *                 type: string
 *                 description: The ID of the user to whom the connection request is sent
 *                 example: "605c72ef1b4e8e3f4e4d8c0d"
 *     responses:
 *       200:
 *         description: Successfully sent connection request
 *         content:
 *           application/json:
 *             schema:
 *               type: boolean
 *               example: true
 *       400:
 *         description: Bad request, invalid parameters or data
 *       401:
 *         description: Unauthorized access, invalid authentication token
 *       409:
 *         description: Conflict, connection request has already been sent for the specified event
 *       500:
 *         description: Internal server error
 */
router.post("/RequestConnection", auth, async function (req, res) {
  try {
    const eventID = req.body.eventID;
    const userID = req.body.userID;
    let msgs = await Message.find({
      $and: [{ eventID: eventID }, { msgStatus: { $ne: 3 } }],
    });
    if (msgs && msgs.length > 0) {
      return returnError(res, "Connection request has been sent before");
    }
    if (userID && eventID) {
      var message = Message();
      message.id = crypto.randomUUID();
      message.msg = "";
      message.type = 4;
      message.providerID = req.user.userID;
      message.eventID = eventID;
      message.userID = userID;
      message.senderID = req.user.userID;
      message.save(function (err) {
        if (err) {
          return returnError(res, "Failed" + err);
        } else {
          sendNotification(
            userID,
            "Connect Request",
            "You have new connection request",
            "PROV_ConnectionRequest"
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

async function sendNotification(userID, title, body, type, isProvider = false) {
  try {
    console.log("user id", userID);
    var tokens = [];
    if (isProvider) {
      let provider = await Provider.findOne({ id: userID });
      console.log("user provider", provider);

      if (provider) {
        tokens.push(provider.fcmToken);
      }
    } else {
      let user = await User.findOne({ id: userID });
      console.log("user user", user);

      if (user) {
        tokens.push(user.fcmToken);
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
  console.log(error);
  return res.status(203).send({ status: 203, data: error });
}

function returnData(res, data) {
  // console.log(data);
  return res.status(200).send({ status: 200, data: data });
}

module.exports = router;
