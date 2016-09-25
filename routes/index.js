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


// Testing query for getting features
router.get('/api/getAllFindings', function(req, res) {
  var results = [];
  var query = apiClient.query("SELECT * FROM mushroom_findings LIMIT 20");
  
  query.on('row', function(row) {
  	results.push(row);
  });
	
  query.on('end', function() {
  	if (results.length == 0) {
  	  res.json("No features to be found!");
  	} else {
  	  res.json(results);
  	}
  });
});


// Testing the 1. applcation query to find the closest mushroom picking place with a desierd mushroom species
router.post('api/getClosestDesiredMushroom', function(req, res) {
  var results = [];
  var data = {latitude: req.body.latitude, longitude: req.body.longitude, mushroom_type: req.body.mushroom_type};
  var query = apiClient.query("SELECT * FROM sd_get_closest_mushroom_finding_with_specific_type_from_lat_lon(" + data.latitude + ", " + data.longitude + ", '" + data.mushroom_type + "')");
	
  query.on('row', function(row) {
  	results.push(row);
  });
  
  query.on('end', function() {
  	if (results.length == 0) {
  	  res.json("No mushrooms!");
  	} else {
  	  res.json(results);
  	}
  });
});




