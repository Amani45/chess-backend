var express = require('express');
var router = express.Router();
var db = require('../database');
var sms = require('../sms');
var auth = require('../authentication');
const dbName = "chess"
const colUsers = "Users"
const colOtps = "Otps"


const USERS = "/users"
const SIGNUP_USER = USERS + "/signup"
const GET_USER_CHESSMEN = USERS + "/get/:userName"
const VALIDATE_USER = USERS + "/validate/:userName"

const VALIDATE_USER_CHESS_CODE = USERS + "/validate/sequence"
const VALIDATE_USER_OTP_CODE = USERS + "/validate/otp"


router.get("/ping", function (req, res, next) {
  res.json({ success : true, message : "Ping Ping!"})
});


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


router.get(VALIDATE_USER, function (req, res, next) {
  const userName = req.params.userName
  db.initialize(dbName, colUsers, (collection) => {


    collection.findOne({ userName: userName }, function (err, user) {
      console.log("User:", user)
      if (err) {
        res.json({ id: "Error in database query", error: err });
      }

      if(user){
       res.json({ success : true})
      }else {
       res.json({ success : false})
      }

    })



  }, (err) => {
    res.json({ success: false, id: "Error in database connection", error: err });
  })
});


/**
 * Signup new user
 */
router.post(SIGNUP_USER, function (req, res, next) {

  db.initialize(dbName, colUsers, (collection) => {

    collection.insertOne(req.body, function (err, user) {
      if (err) {
        res.json({ id: "Error in database query", error: err });
      }
      res.json({ success : true, body : {id : user.insertedId, ...req.body}})

    })

  }, (err) => {
    res.json({ id: "Error in database connection", error: err });
  })
});

// get user selected chessman 
router.get(GET_USER_CHESSMEN, function (req, res, next) {

  const userName = req.params.userName
  db.initialize(dbName, colUsers, (collection) => {

    // collection.findOne({ userName: userName })
    // .project({ userName: 1, chessSize: 1, 'chessCode.x': 1, 'chessCode.y': 1 },function (err, item) {
    //   if (err) {
    //     res.json({success: false, body : err})

    //   }
    //   res.json({success: true, body : item})
    // })


    collection.find({ userName: userName })
      .project({ userName: 1, chessSize: 1, 'chessCode.x': 1, 'chessCode.y': 1 })
      .toArray(function (err, item) {
        console.log("ITEM:", item)
        if(item.length == 0){
          res.json({success: false, body : "User Not found!"})
          return
        }
        if (err) {
          res.json({ id: "Error in database query", error: err });
          res.json({success: false, body : f})
        }
        res.json({success: true, body : item})

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

      if (auth.validateSequence(sequenceCode.map(code => code.newMove), user.chessCode, user.chessSize)) {
        otp = auth.generateOTP()
        db.initialize(dbName, colOtps, (collectionOtp) => {

          collectionOtp.findOne({ userName: userName }, function (err, currentOtp) {
            if (err) {
              res.json({ id: "Error in database query", error: err });
            }
            if(currentOtp){
              sms.sendSMS(user.phone, currentOtp.otp)
              res.json({ success: true, message: "OTP SMS sent" })
            }else {
              collectionOtp.insert({ userName: user.userName, otp: otp }, function (err, ids) {
                if (err) {
                  res.json({ id: "Error in database query", error: err });
                }
                sms.sendSMS(user.phone, otp)
                res.json({ success: true, message: "OTP SMS sent" })
              })
            }
            




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

  console.log(userName, " VS ", otpCode)

  db.initialize(dbName, colOtps, (collection) => {

    collection.findOne({ userName: userName }, function (err, otpDocument) {
      if (err) {
        res.json({ id: "Error in database query", error: err });
      }

      console.log("OTP Doc", otpDocument)

      if(otpDocument && otpDocument.otp == otpCode){
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
