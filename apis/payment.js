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
const Events = require('../models/event.model');
const Messages = require('../models/message.model');
//https://developer.paypal.com/braintree/docs/start/hello-server/node
const gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: config.MERCHANT_ID,
    publicKey: config.PAY_PUBLIC,
    privateKey: config.PAY_SECRET
  });
function uuidv4() {
    return crypto.randomUUID();
}

router.route('/Authorize').post([myAuth , auth],function (req, res) {
      gateway.clientToken.generate({}, (err, response) => {
        res.send(response.clientToken);
      });
});
router.route('/checkout').post([myAuth , auth],async function (req, res) {
    const nonceFromTheClient = req.body.nonceFromTheClient;
    const deviceData = req.body.deviceData;
    let amount = req.body.amount;
    const eventID = req.body.eventID;
    const msgId = req.body.msgId;
    if(!amount){
      let event = await Events.findOne({id: eventID});
      try{
        Number.parseFloat(event.dealCost);
        amount = event.dealCost;
      }catch(err){
        amount = '0';
      }
    }
    if(amount === '0'){
      return returnData(res , "Amount not detected");
    }
    gateway.transaction.sale({
        amount: amount ,//"10.00",
        paymentMethodNonce: nonceFromTheClient,
        deviceData: deviceData,
        options: {
          submitForSettlement: true
        }
      },async (err, result) => {
        if(err)
            return returnError(res , err);
        if(result){
          let event = await Events.findOne({id: eventID});
          let msgObj = await Messages.findOne({id: msgId});
          if(event){
            msgObj.msgStatus = 6;
            event.status = 3;
            event.save();
            msgObj.save();
          }
          return returnData(res , {result: result , event: event});
        }
      });
});

router.route('/checkoutSim').post([myAuth , auth],async function (req, res) {
  // const nonceFromTheClient = req.body.nonceFromTheClient;
  // const deviceData = req.body.deviceData;
  let amount = req.body.amount;
  const eventID = req.body.eventID;
  if(!amount){
    let event = await Events.findOne({id: eventID});
    try{
      Number.parseFloat(event.dealCost);
      amount = event.dealCost;
    }catch(err){
      amount = '0';
    }
  }
  if(amount === '0'){
    return returnData(res , "Amount not detected");
  }
  // const eventID = req.body.eventID;
  let event = await Events.findOne({id: eventID});
  if(event){
    event.status = 3;
    event.save();
    return returnData(res , {status: 200 , message: "success"});
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

function returnError(res, error) {
    return res.status(203).send({ status: 203, data: error });
}

function returnData(res, data) {
    return res.status(200).send({ status: 200, data: data });
}
module.exports = router;
