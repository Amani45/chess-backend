var express = require('express');
var router = express.Router();
var db = require('../database');
var sms = require('../sms');
var auth = require('../authentication');
const dbName = "chess"
const colUsers = "Users"
const colOtps = "Otps"
var Gpio = require('onoff').Gpio;
var LED = new Gpio(4, 'out');


const USERS = "/users"
const SIGNUP_USER = USERS + "/signup"
const GET_USER_CHESSMEN = USERS + "/get/:userName"
const VALIDATE_USER = USERS + "/validate/:userName"

const VALIDATE_USER_CHESS_CODE = USERS + "/validate/sequence"
const VALIDATE_USER_OTP_CODE = USERS + "/validate/otp"


router.get("/ping", function (req, res, next) {
  res.json({ success: true, message: "Ping Ping!" })
});

router.get("/open", function (req, res, next) {
  if (LED.readSync() === 0) { //check the pin state, if the state is 0 (or off)
    LED.writeSync(1); //set pin state to 1 (turn LED on)
    setTimeout( ()=>{
      LED.writeSync(0); //set pin state to 0 (turn LED off)
    }, 1000)
  } 
  res.json({ success: true, message: "Sending Open Single!" })
});

router.get("/sms/:phone", function (req, res, next) {
  const phone = req.params.phone
  sms.sendSMS(phone, auth.generateOTP())
  res.json({ success: true, message: "Sending SMS to " + phone })
});


router.get(VALIDATE_USER, function (req, res, next) {
  const userName = req.params.userName
  db.initialize(dbName, colUsers, (collection) => {


    collection.findOne({ userName: userName }, function (err, user) {
      console.log("User:", user)
      if (err) {
        res.json({ id: "Error in database query", error: err });
      }

      if (user) {
        res.json({ success: true })
      } else {
        res.json({ success: false })
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
      res.json({ success: true, body: { id: user.insertedId, ...req.body } })

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
      .project({ userName: 1, chessSize: 1, 'chessCode.x': 1, 'chessCode.y': 1 ,secret : 1 })
      .toArray(function (err, item) {
        console.log("ITEM:", item)
        if (item.length == 0) {
          res.json({ success: false, body: "User Not found!" })
          return
        }
        if (err) {
          res.json({ id: "Error in database query", error: err });
          res.json({ success: false, body: f })
        }


      if(item[0].secret){
        randomSecret = Math.floor(Math.random() * item[0].chessCode.length);
        item[0].chessCode[randomSecret].isSecret = true
        auth.createSecretLocation(userName,randomSecret)
      }

      res.json({ success: true, body: item })

      })
  }, (err) => {
    res.json({ id: "Error in database connection", error: err });
  })
});

// validate user chess code
router.post(VALIDATE_USER_CHESS_CODE, function (req, response, next) {

  const userName = req.body.userName
  const sequenceCode = req.body.sequenceCode


  //
  auth.isValidAccount(userName, function (res) {
    switch (res.status) {
      case false: {
        response.json({ success: false, message: res.message })
        break;
      }
      default: {

        db.initialize(dbName, colUsers, (collection) => {

          collection.findOne({ userName: userName }, function (err, user) {
            console.log("ITEM:", user)
            if (err) {
              response.json({ id: "Error in database query", error: err });
            }

           auth.getSecretLocation(user.userName, (res)=>{
             console.log("RES SECRET : ", res)

             if(res.success){
              user.chessCode[res.location].chessman= user.secret
             }

             //
             if (auth.validateSequence(sequenceCode.map(code => code.newMove), user.chessCode, user.chessSize)) {
              otp = auth.generateOTP()
              db.initialize(dbName, colOtps, (collectionOtp) => {

                collectionOtp.findOne({ userName: userName }, function (err, currentOtp) {
                  if (err) {
                    response.json({ id: "Error in database query", error: err });
                  }
                  if (currentOtp) {
                    sms.sendSMS(user.phone, currentOtp.otp)
                    response.json({ success: true, message: "OTP SMS sent" })
                  } else {
                    collectionOtp.insert({ userName: user.userName, otp: otp }, function (err, ids) {
                      if (err) {
                        response.json({ id: "Error in database query", error: err });
                      }
                      sms.sendSMS(user.phone, otp)
                      response.json({ success: true, message: "OTP SMS sent" })
                    })
                  }





                })
              }, (err) => {
                response.json({ id: "Error in database connection", error: err });
              })

            } else {


              db.initialize(dbName, 'attempts', (collection) => {

                collection.findOne({ userName: userName }, function (err, res) {

                  if (err) {
                    //response.json({ id: "Error in database query", error: err });
                  } else {
                    if (res == null) {
                      console.log('No Recorrd', res)
                      collection.insertOne({ userName: userName, lastTime: new Date(), attempt: 1 }, function (err, user) {
                        if (err) {
                          // response.json({ id: "Error in database query", error: err });
                        }
                        // response.json({ success: true, body: { id: user.insertedId, ...req.body } })

                      })

                    } else {
                      console.log('Already there', res)

                      collection.update({ userName: userName }, { $set: { 'lastTime': new Date(), 'attempt': res.attempt + 1 } }, function (err, user) {
                        if (err) {
                          //response.json({ id: "Error in database query", error: err });
                        }
                      })
                    }
                  }



                })


                // collection.insertOne(req.body, function (err, user) {
                //   if (err) {
                //     response.json({ id: "Error in database query", error: err });
                //   }
                //   response.json({ success: true, body: { id: user.insertedId, ...req.body } })

                // })

              }, (err) => {
                response.json({ id: "Error in database connection", error: err });
              })


              response.json({ success: false, message: "Chess Sequence is not valid" })
            }
             //

           })

 

          })



        }, (err) => {
          res.json({ id: "Error in database connection", error: err });
        })

      }

    }

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

      if (otpDocument && otpDocument.otp == otpCode) {
        collection.deleteOne({ userName: userName }, function (err, otpDocument) {
          if (err) {
            res.json({ id: "Error in database query", error: err });
          }
          // 
          if (LED.readSync() === 0) { //check the pin state, if the state is 0 (or off)
            LED.writeSync(1); //set pin state to 1 (turn LED on)
            setTimeout( ()=>{
              LED.writeSync(0); //set pin state to 0 (turn LED off)

            }, 1000)
          } 
          //
          res.json({ success: true, message: "OTP SMS is valid" })
        })

      } else {
        res.json({ success: false, message: "OTP SMS is not valid" })
      }
    })

  }, (err) => {
    res.json({ id: "Error in database connection", error: err });
  })
});


module.exports = router;
