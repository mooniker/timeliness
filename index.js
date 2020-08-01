var env; // configuration variables
try { // check if local env.js exists for dev server
  env = require('./env');
} catch (localEnvJsNotPresentException) {
  // otherwise use production server's config vars
  env = process.env;
}

var express = require('express');
var _ = require('underscore');

var app = express();

var wmata = require('./wmata.js');
var schedule = require('./schedule.js');

var scheduleJson;



app.get('/ping', function(request, response) {
  response.json({ body: 'pong' });
});

var stopIds;
var db = {};

var currentStopIndex = 0;
function pollBusStops() {
  wmata.getNextBuses(stopIds[currentStopIndex], function(err, data) {
    if (!err) {
      var predictions = data.Predictions.filter(function(trip) {
        return trip.RouteID == 'MW1';
      });
      // console.log(predictions);
      for (var i = 0; i < predictions.length; i++) {
        if (predictions[i].Minutes == '0') {
          console.log('ARRIVAL at #' + stopIds[i], predictions[i]);
          if (scheduleJson) console.log('Recorded');
          // console.log('Scheduled:', wmata.getDeltaFromSchedule(scheduleJson, predictions[i].TripID, predictions[i].StopID));
          console.log('Scheduled:', schedule.query(scheduleJson, predictions[i].TripID, predictions[i].StopID));
        } else {
          console.log('no bus at #' + stopIds[i], predictions[i].Minutes);
        }
      }
    } else console.error(err);
  });
  currentStopIndex++;
  if (currentStopIndex >= stopIds.length) currentStopIndex = 0;
}

wmata.getSchedule('MW1', function(err, data) {
  if (!err) {
    scheduleJson = data;
    // console.log('Scheduled', scheduleJson);
    var dir0 = scheduleJson.Direction0[0].StopTimes.map(function(stop) {
      return stop.StopID;
    });
    var dir1 = scheduleJson.Direction1[1].StopTimes.map(function(stop) {
      return stop.StopID;
    });
    stopIds = _.union(dir0, dir1);
    console.log('Bus stops:', stopIds.length);
    setInterval(pollBusStops, 150);
  }
});

app.get('/schedule', function(request, response) {
  if (!scheduleJson) {
    wmata.getSchedule('MW1', function(err, data) {
      response.json(err || data);
    });
  } else {
    response.json(scheduleJson);
  }
});

app.get('/stop/:stopId', function(request, response) {
  wmata.getNextBuses(request.params.stopId, function(err, data) {
    // console.log(request.params.stopId);
    response.json(err || data);
  });
});

app.get('/stops', function(request, response) {
  response.json(stopIds);
});

app.get('/query', function(request, response) {
  // console.log(request.params.tripId, request.params.stopId);
  if (!scheduleJson) {
    wmata.getSchedule('MW1', function(err, data) {
      response.json(err || data);
    });
  }
  // response.json(wmata.checkSchedule(request.params.tripId, request.params.stopId));
  // console.log('hellllllo!');
  // response.json(wmata.querySchedule(scheduleJson, '8753916', '4000478'));
  response.json(schedule.query(scheduleJson, '8754363', '4000478'));
});




var port = env.PORT;
app.listen(port, function() {
  console.log('Server up and running on port', port + '.');
});
