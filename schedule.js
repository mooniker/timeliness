function queryDirection(scheduleJson, dir, tripId, stopId) {
  // var direction = 'Direction' + dir.toString();
  var trips = scheduleJson['Direction' + dir.toString()].filter(function(trip) {
    return trip.TripID == tripId
  });

  if (trips.length <= 0) {
    console.log('No matching tripId found in schedule');
    return 0;
  } else if (trips.length > 1) {
    console.log('Multiple matching tripIds found in schedule');
    return 'too many tripIds';
  } else {
    var stops = trips[0].StopTimes.filter(function(stop) {
      return stop.StopID == stopId;
    });
    if (stops.length <= 0) {
      console.log('No matching stopIds found for this tripId');
      return 0;
    } else if (stops.length > 1) {
      console.log('multiple matching stopIds found for this trip id');
      return 'too many stopIds'
    } else {
      console.log('**************************************YAYYYY: ', stops[0].Time)
      return stops[0].Time;
    }
  }
  return null;
}


module.exports = {

  query: function(scheduleJson, tripId, stopId) {

    if (!scheduleJson) {
      console.error('scheduleJson', scheduleJson);
      return null;
    }
    return [queryDirection(scheduleJson, 0, tripId, stopId), queryDirection(scheduleJson, 1, tripId, stopId)];

    // return results;

  }
};
