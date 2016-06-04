var env; // configuration variables
try { // check if local env.js exists for dev server
  env = require('./env');
} catch (localEnvJsNotPresentException) {
  // otherwise use production server's config vars
  env = process.env;
}

var express = require('express');

var app = express();
// var request = require('request');

var wmata = require('./wmata.js');

var scheduleJson = undefined;

app.get('/ping', function(request, response) {
  response.json({ body: 'pong' });
});

var stopIds = undefined;
var currentStopIndex = 0;

wmata.getSchedule('MW1', function(err, data) {
  if (!err) {
    scheduleJson = data;
    stopIds = scheduleJson.Direction0[0].StopTimes.map(function(stop) {
      return stop.StopID;
    });
    setInterval(function() {
      // wmata.getBus
    }, 1000);
  }
});

app.get('/schedule', function(request, response) {
  if (!scheduleJson) {
    wmata.getSchedule('MW1', function(err, data) {
      response.json(err || data);
    });
  }
});

app.get('/stops', function(request, response) {
  response.json(stopIds);
});

app.get('/:tripId/:stopId', function(request, response) {
  // console.log(request.params.tripId, request.params.stopId);
  if (!scheduleJson) {
    wmata.getSchedule('MW1', function(err, data) {
      response.json(err || data);
    });
  }
  // response.json(wmata.checkSchedule(request.params.tripId, request.params.stopId));
  console.log('hellllllo!');
  response.json(wmata.querySchedule(scheduleJson, '8753916', '4000478'));
});



var port = env.PORT;
app.listen(port, function() {
  console.log('Server up and running on port', port + '.');
});
