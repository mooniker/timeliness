var env = require('./env.js');
var request = require('request');

var helpers = {
  // converts key/values to URI/URL params
  renderParamsForUri: function(searchParamsAsJson) {
    var uriParamString = '?';
    for (var key in searchParamsAsJson) {
      if (uriParamString !== '') {
        uriParamString += '&';
      }
      uriParamString += key + '=' + encodeURIComponent(searchParamsAsJson[key]);
    }
    return uriParamString;
  },
};

module.exports = {

  getSchedule: function(routeId, callback) {
    var url = 'https://api.wmata.com/Bus.svc/json/jRouteSchedule' + helpers.renderParamsForUri({
      RouteID: routeId,
      api_key: env.WMATA_KEY
    });
    console.log('requested', url);
    request(url, function(err, response, body) {
      if (!err && response.statusCode === 200) {
        callback(null, JSON.parse(body));
      } else callback(err || 'ERROR: WMATA says ' + response.statusCode);
    });
  },

  querySchedule: function(scheduleJson, tripId, stopId) {
    var results = [];

    var dir0 = scheduleJson.Direction0;

    var dir0_trip = dir0.filter(function(trip) {
      return trip.TripID == tripId;
    })[0].StopTimes;

    var dir0_stop = dir0_trip.filter(function(stop) {
      return stop.StopID == stopId;
    })[0];

    results.push(dir0_stop.Time);

    // if (scheduleJson.Direction1) {
    //
    //   var dir1 = scheduleJson.Direction1;
    //
    //   var dir1_trip = dir1.filter(function(trip) {
    //     return trip.TripID == tripId;
    //   })[0].StopTimes;
    //
    //   var dir1_stop = dir1_trip.filter(function(stop) {
    //     return stop.StopID == stopId;
    //   })[0];
    //
    //   results.push(dir1_stop.Time);
    //
    // }

    return results;

  }

};
