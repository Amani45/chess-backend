var express = require('express');
var router = express.Router();
var db = require('../database');
var sms = require('../sms');
var auth = require('../authentication');

const dbName = "chess"
const colUsers = "Users"
const colOtps = "Otps"


const USERS = "/users"
const ADD_USER = USERS + "/add"
const GET_USER_CHESSMEN = USERS + "/get/:userName"
const VALIDATE_USER_CHESS_CODE = USERS + "/validate/sequence"
const VALIDATE_USER_OTP_CODE = USERS + "/validate/otp"


/**
 * Find All Users
 */
router.get(USERS, function (req, res, next) {
  db.initialize(dbName, colUsers, (collection) => {

    collection.find().toArray(function (err, items) {


      if (err) {
        res.json({ id: "Error in database query", error: err });
      }
      sms.sendSMS("+966540410245", auth.generateOTP())
      res.json(items);
    });

  }, (err) => {
    res.json({ id: "Error in database connection", error: err });
  })
});

router.post(ADD_USER, function (req, res, next) {

  db.initialize(dbName, colUsers, (collection) => {

    collection.insert(req.body, function (err, ids) {
      if (err) {
        res.json({ id: "Error in database query", error: err });
      }
      res.json(ids)

    })

  }, (err) => {
    res.json({ id: "Error in database connection", error: err });
  })
});

// get user selected chessman 
router.get(GET_USER_CHESSMEN, function (req, res, next) {

  const userName = req.params.userName
  db.initialize(dbName, colUsers, (collection) => {


    collection.find({ userName: userName })
      .project({ userName: 1, chessSize: 1, 'chessCode.x': 1, 'chessCode.y': 1 })
      .toArray(function (err, item) {
        console.log("ITEM:", item)
        if (err) {
          res.json({ id: "Error in database query", error: err });
        }
        res.json(item)

      })
  }, (err) => {
    res.json({ id: "Error in database connection", error: err });
  })
});

// validate user chess code
router.post(VALIDATE_USER_CHESS_CODE, function (req, res, next) {

  const userName = req.body.userName
  const sequenceCode = req.body.sequenceCode

  db.initialize(dbName, colUsers, (collection) => {


    collection.findOne({ userName: userName }, function (err, user) {
      console.log("ITEM:", user)
      if (err) {
        res.json({ id: "Error in database query", error: err });
      }

      if (auth.validateSequence(sequenceCode, user.chessCode, user.chessSize)) {
        otp = auth.generateOTP()
        db.initialize(dbName, colOtps, (collectionOtp) => {

          collectionOtp.insert({ userName: user.userName, otp: otp }, function (err, ids) {
            if (err) {
              res.json({ id: "Error in database query", error: err });
            }
            sms.sendSMS(user.phone, otp)
            res.json({ success: true, message: "OTP SMS sent" })
          })

        }, (err) => {
          res.json({ id: "Error in database connection", error: err });
        })

      } else {
        res.json({ success: false, message: "Chess Sequence is not valid" })
      }

    })



  }, (err) => {
    res.json({ id: "Error in database connection", error: err });
  })
});


// validate the OTP
router.post(VALIDATE_USER_OTP_CODE, function (req, res, next) {

  const userName = req.body.userName
  const otpCode = req.body.otpCode

  db.initialize(dbName, colOtps, (collection) => {

    collection.findOne({ userName: userName }, function (err, otpDocument) {
      if (err) {
        res.json({ id: "Error in database query", error: err });
      }

      if(otpDocument.otp == otpCode){
        collection.deleteOne({ userName: userName }, function (err, otpDocument) {
          if (err) {
            res.json({ id: "Error in database query", error: err });
          }
          res.json({ success: true, message: "OTP SMS is valid" })
          
        })

      }else {
        res.json({ success: false, message: "OTP SMS is not valid" }) 
      }
    })

  }, (err) => {
    res.json({ id: "Error in database connection", error: err });
  })
});


module.exports = router;
