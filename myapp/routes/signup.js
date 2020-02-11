var express = require('express');
var router = express.Router();


let user = {
  userName : 'signup'
}

/* GET users listing. */
router.post('/', function(req, res, next) {
 console.log(req.body)
  res.send(user);
});

module.exports = router;
