
var express = require('express');
var router = express.Router();


let user = {
  userName : 'Amani'
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send(user);
});

module.exports = router;
