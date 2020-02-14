var express = require('express');
var router = express.Router();
var db = require('../database');
var sms = require('../sms');
var auth = require('../authentication');

const dbName = "chess"
const colUsers = "Users"


const USERS = "/users"
const ADD_USER = USERS + "/add"
const GET_USER_CHESSMEN = USERS + "/get/:userName"


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

    // collection.find().toArray(function (err, items) {
    //   if (err) {
    //     res.json({ id: "Error in database query", error: err });
    //   }
    // });
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

module.exports = router;
