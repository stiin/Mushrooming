// Server-Side: Routes
var pg = require('pg');
var credentials = require('../dbcredentials/credentials.js');
var apiClient = new pg.Client(credentials);

var express = require('express');
var router = express.Router();

// Handle errors in routing
apiClient.on('notice', function(msg) {
    console.log("notice: %j", msg);
});

apiClient.on('error', function(error) {
    console.log(error);
});

apiClient.connect(function(err){
    if (err){
        return console.error('could not connect to postgres', err);
    }
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
