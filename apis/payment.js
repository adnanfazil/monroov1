const express = require('express');
var router = express.Router();
const myAuth = require("../middleware/myAuth");
let auth = require("../middleware/auth");
const config = process.env;

const braintree = require("braintree");

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/users.model');
const Provider = require('../models/provider.model');
const PaymentIntention = require('../models/payment.model');
const Events = require('../models/event.model');
const Messages = require('../models/message.model');
//https://developer.paypal.com/braintree/docs/start/hello-server/node
const gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: config.MERCHANT_ID,
    publicKey: config.PAY_PUBLIC,
    privateKey: config.PAY_SECRET
});


/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Operations related to payment
 */


function uuidv4() {
    return crypto.randomUUID();
}


/**
 * @swagger
 * /monroo/apis/payment/Authorize:
 *   post:
 *     summary: Generate a Braintree client token for authorization
 *     tags: [Payment]
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Successful response with the Braintree client token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clientToken:
 *                   type: string
 *                   description: The Braintree client token used for authentication
 *                   example: "sandbox_1234567890abcdef"
 *       401:
 *         description: Unauthorized if the user is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Unauthorized"
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
 *                   example: "Error generating client token"
 */
router.route('/Authorize').post([myAuth, auth], function(req, res) {
    gateway.clientToken.generate({}, (err, response) => {
        res.send(response.clientToken);
    });
});


/**
 * @swagger
 * /monroo/apis/payment/checkout:
 *   post:
 *     summary: Process a Braintree transaction and update event and message status
 *     tags: [Payment]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nonceFromTheClient:
 *                 type: string
 *                 description: Payment method nonce received from the client
 *                 example: "nonceFromClient"
 *               deviceData:
 *                 type: string
 *                 description: Device data for additional security
 *                 example: "deviceData"
 *               amount:
 *                 type: string
 *                 description: The amount to be charged. Optional; if not provided, it is retrieved from the event.
 *                 example: "10.00"
 *               eventID:
 *                 type: string
 *                 description: The ID of the event associated with the transaction
 *                 example: "event123"
 *               msgId:
 *                 type: string
 *                 description: The ID of the message to be updated
 *                 example: "msg456"
 *     responses:
 *       200:
 *         description: Successful response with transaction result and updated event information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: object
 *                   description: The result of the Braintree transaction
 *                   example:
 *                     success: true
 *                     transaction:
 *                       id: "transactionId"
 *                       amount: "10.00"
 *                       status: "submitted_for_settlement"
 *                 event:
 *                   type: object
 *                   description: The updated event information
 *                   example:
 *                     id: "event123"
 *                     status: 3
 *       400:
 *         description: Bad request if required fields are missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Amount not detected"
 *       500:
 *         description: Internal server error if there is an issue with processing the transaction
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Transaction error"
 */
router.route('/checkout').post([myAuth, auth], async function(req, res) {
    const nonceFromTheClient = req.body.nonceFromTheClient;
    const deviceData = req.body.deviceData;
    let amount = req.body.amount;
    const eventID = req.body.eventID;
    const msgId = req.body.msgId;
    if (!amount) {
        let event = await Events.findOne({ id: eventID });
        try {
            Number.parseFloat(event.dealCost);
            amount = event.dealCost;
        } catch (err) {
            amount = '0';
        }
    }
    if (amount === '0') {
        return returnData(res, "Amount not detected");
    }
    gateway.transaction.sale({
        amount: amount, //"10.00",
        paymentMethodNonce: nonceFromTheClient,
        deviceData: deviceData,
        options: {
            submitForSettlement: true
        }
    }, async(err, result) => {
        if (err)
            return returnError(res, err);
        if (result) {
            let event = await Events.findOne({ id: eventID });
            let msgObj = await Messages.findOne({ id: msgId });
            if (event) {
                msgObj.msgStatus = 6;
                event.status = 3;
                event.save();
                msgObj.save();
            }
            return returnData(res, { result: result, event: event });
        }
    });
});

/**
 * @swagger
 * /monroo/apis/payment/checkoutSim:
 *   post:
 *     summary: Simulate a transaction by updating the event status
 *     tags: [Payment]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transID:
 *                 type: string
 *                 description: Transaction ID used for simulation
 *                 example: "trans123"
 *               eventID:
 *                 type: string
 *                 description: The ID of the event to update
 *                 example: "event123"
 *     responses:
 *       200:
 *         description: Successful response with status update
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: HTTP status code
 *                   example: 200
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: "success"
 *       400:
 *         description: Bad request if required fields are missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Error trans id not valid"
 *       404:
 *         description: Not found if the event with the provided ID does not exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Event not found"
 *       500:
 *         description: Internal server error if there is an issue with the operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Internal server error"
 */
router.route('/checkoutSim').post([myAuth, auth], async function(req, res) {
    // const nonceFromTheClient = req.body.nonceFromTheClient;
    // const deviceData = req.body.deviceData;
    let transID = req.body.transID;
    const eventID = req.body.eventID;
    if (!transID) {
        return returnError(res, "Error trans id not valid");
    }
    if (amount === '0') {
        return returnData(res, "Amount not detected");
    }
    // const eventID = req.body.eventID;
    let event = await Events.findOne({ id: eventID });
    if (event) {
        event.status = 3;
        event.save();
        return returnData(res, { status: 200, message: "success" });
    }
    // gateway.transaction.sale({
    //     amount: amount ,//"10.00",
    //     paymentMethodNonce: nonceFromTheClient,
    //     deviceData: deviceData,
    //     options: {
    //       submitForSettlement: true
    //     }
    //   },async (err, result) => {
    //     if(err)
    //         return returnError(res , err);
    //     if(result){
    //       const eventID = req.body.eventID;
    //       let event = await Events.findOne({id: eventID});
    //       if(event){
    //         event.status = 3;
    //         event.save();
    //       }
    //       return returnData(res , {result: result , event: event});
    //     }
    //   });
});

/**
 * @swagger
 * /monroo/apis/payment/complete:
 *   get:
 *     summary: Completes an event and updates the message status
 *     tags: [Payment]
 *     parameters:
 *       - in: query
 *         name: eventID
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the event to be completed.
 *         example: "event_123456789"
 *       - in: query
 *         name: msgID
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the message whose status will be updated.
 *         example: "msg_123456789"
 *     responses:
 *       302:
 *         description: Redirects to the specified URL after completing the event and updating the message status.
 *         headers:
 *           Location:
 *             description: URL to which the client is redirected.
 *             schema:
 *               type: string
 *               example: "http://monroo.co/"
 *       400:
 *         description: Bad request if `eventID` or `msgID` is missing.
 *       404:
 *         description: Not Found if no event or message is found for the provided IDs.
 *       500:
 *         description: Internal server error if an issue occurs during the process.
 */
router.route('/complete').get(async function(req, res) {
    let eventID = req.query.eventID;
    let msgID = req.query.msgID;
    if (eventID && msgID) {
        let event = await Events.findOne({ id: eventID });
        let msgObj = await Messages.findOne({ id: msgID });
        if (event) {
            msgObj.msgStatus = 6;
            event.status = 3;
            event.save();
            msgObj.save();
        }
    }
    res.redirect('http://monroo.co/');

});


/**
 * @swagger
 * /monroo/apis/payment/newCheckout:
 *   post:
 *     summary: Initiates a payment transaction using Paymob API and saves payment intention details
 *     tags: [Payment]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       description: The details required to process a payment transaction.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 format: float
 *                 description: The amount to be charged in fils (e.g., 1000 fils = 1 AED).
 *                 example: 2000
 *               userID:
 *                 type: string
 *                 description: The unique identifier of the user.
 *                 example: "user_123"
 *               providerID:
 *                 type: string
 *                 description: The unique identifier of the provider.
 *                 example: "provider_123"
 *               eventID:
 *                 type: string
 *                 description: The unique identifier of the event.
 *                 example: "event_123"
 *               msgID:
 *                 type: string
 *                 description: The unique identifier of the message.
 *                 example: "msg_123"
 *     responses:
 *       200:
 *         description: Successful response with the payment intention result from Paymob.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The unique identifier of the payment intention.
 *                   example: "pay_int_123"
 *                 status:
 *                   type: string
 *                   description: The status of the payment intention.
 *                   example: "pending"
 *                 payment_url:
 *                   type: string
 *                   description: URL to redirect the user for payment.
 *                   example: "https://paymob.com/checkout?token=abc123"
 *       400:
 *         description: Bad request if the amount or required parameters are missing.
 *       500:
 *         description: Internal server error if an issue occurs during the payment process or saving the payment intention.
 */
router.route('/newCheckout').post([myAuth, auth], async function(req, res) {
    var myHeaders = new Headers();

    var secretKey = process.env.PAYMOB_SECREt;
    myHeaders.append("Authorization", `Token ${secretKey}`);
    myHeaders.append("Content-Type", "application/json");
    let amount = req.body.amount;
    const { userID, providerID, eventID, msgID } = req.body;
    if (!amount) {
        let event = await Events.findOne({ id: eventID });
        try {
            Number.parseFloat(event.dealCost);
            amount = event.dealCost * 1000;
        } catch (err) {
            amount = '0';
        }
    }
    if (amount === '0') {
        return returnData(res, "Amount not detected");
    }
    let user = await User.findOne({ id: userID });
    let provider = await Provider.findOne({ id: providerID });
    var raw = JSON.stringify({
        "amount": amount,
        "currency": "AED",
        "redirection_url": "http://monroo.co/checkout-status?eventID=" + eventID + "&userID=" + userID + "&providerID=" + providerID,
        "payment_methods": [
            46394
        ],
        "items": [{
                "name": 'User => ' + userID,
                "amount": (amount / 2),
                "description": eventID,
                "quantity": 1
            },
            {
                "name": 'Provider => ' + providerID,
                "amount": (amount / 2),
                "description": eventID,
                "quantity": 1
            }
        ],
        "billing_data": {
            "apartment": "6",
            "first_name": user.name,
            "last_name": userID,
            "street": "",
            "building": user.companyName,
            "phone_number": user.phone,
            "country": user.country,
            "email": user.email,
            "floor": "",
            "state": ""
        },
        "special_reference": uuidv4() + '-' + eventID,
        "customer": {
            "first_name": provider.fname,
            "last_name": provider.lname,
            "email": 'nizar.abuahmad@gmail.com', //provider.email,
            "extras": {
                "re": providerID
            }
        },
        "extras": {
            "ee": 0
        }
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: `follow`
    };
    //http://51.21.127.77:3000/monroo/apis/payment/complete?eventID=${eventID}&msgID=${msgID}
    fetch("https://uae.paymob.com/v1/intention/", requestOptions)
        .then(response => response.json())
        .then(async result => {
            console.log(result);
            let payData = PaymentIntention(result);
            payData.userID = userID;
            payData.providerID = providerID;
            payData.eventID = eventID;
            try {
                // let event = await Events.findOne({id: eventID});
                // let msgObj = await Messages.findOne({id: msgID});
                // if(event){
                //   msgObj.msgStatus = 6;
                //   event.status = 3;
                //   event.save();
                //   msgObj.save();
                // }
            } catch (ex) {

            }

            payData.save(function(err) {
                returnData(res, result)

            });
        })
        .catch(error => { console.log(error);
            returnError(res, error); });
});

function uuidv4() {
    return crypto.randomUUID();
}

function returnError(res, error) {
    return res.status(203).send({ status: 203, data: error });
}

function returnData(res, data) {
    return res.status(200).send({ status: 200, data: data });
}
module.exports = router;