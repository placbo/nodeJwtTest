// Include the modules needed for our server.
var express = require('express');
var cors = require('cors');
var app = express();
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var hash = require('hash.js');

function verifyToken(req, res, next) {
  var token = req.headers['x-access-token'];
  if (!token)  res.status(403).send({ auth: false, message: 'No token provided.' });
  jwt.verify(token, 'passord', function(err, decoded) {
    if (err)  res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    req.userId = decoded.id;
    next();
  });
}

var token = jwt.sign({ sub : "1234567890", name : "PCB", admin: true }, 'passord', {
      expiresIn: 86400 // expires in 24 hours
    }
);

app.use(cors());

app.get('/ping', function(req, res) {
  res.status(200).send({text: "All good. You don't need to be authenticated to call this"});
});

 app.get('/secureping',verifyToken, function(req, res) {
   res.status(200).send({text: "All 2 good. You only get this message if you're authenticated"});
 });

app.get('/token', function(req, res){
    res.status(200).send({ auth: true, token: token });
});

app.post('/login',urlencodedParser, function(req, res){
  console.log(hash.sha256().update('1234').digest('hex'));
  var pin = req.body.pin;
  if (pin === "03AC674216F3E15C761EE1A5E255F067953623C8B388B4459E13F978D7C846F4"){
    res.status(200).send({ auth: true, token: token });
  } else {
    res.status(401).send({ auth: false, message: 'Failed log in' });
  }
});


var port = process.env.PORT || 3001;
var server = app.listen(port, function (err) {
  console.log('listening in http://localhost:' + port);
});
