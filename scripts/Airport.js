MapIt.Airport = function(map, options) {
  console.log('MapIt.Airport: Initializing Airport ViewModel');
  var self = this;

  // This is JSON so the quotes should stay as double quotes
  var emptyJSON = '{' +
    '"code":"",' +
    '"lat":"",' +
    '"lon":"",' +
    '"name":"",' +
    '"city":"",' +
    '"state":"",' +
    '"country":"",' +
    '"woeid":"",' +
    '"tz":"",' +
    '"phone":"",' +
    '"type":"",' +
    '"email":"",' +
    '"url":"",' +
    '"runway_length":"",' +
    '"elev":"",' +
    '"icao":"",' +
    '"direct_flights":"",' +
    '"carriers":""' +
  '}';
      
  self.emptyData = JSON.parse(emptyJSON);
  self.name = options.name;

  self.isAirportSelected = ko.computed({
    read: function() {
      return !(typeof self.airportData() === 'undefined' || typeof self.airportData().code === 'undefined' || self.airportData().code === '');
    },
    owner: self,
    deferEvaluation: true
  });

  self.airportSearchInput = ko.observable();
  self.airportSearchBaseUrl = 'http://airports.pidgets.com/v1/airports/';
  self.airportSearchSuffix = '?format=json&callback=alert';
  self.airportSearchUrl = ko.computed(function () {
    var output = self.airportSearchBaseUrl + self.airportSearchInput() + self.airportSearchSuffix;
    console.log('Airport Search Url: ' + output);
    return output;
  });

  self.airportData = ko.computed({
    read: function() {
      console.log('Airport.airportData: Reading input for airport ' + self.name + ', value is: "' + self.airportSearchInput() + '"');

      if(typeof airportsJSON === 'undefined' || typeof self.airportSearchInput() === 'undefined' || self.airportSearchInput().length === 0) {
        console.log('Airport.airportData: No airport search input supplied, or no JSON data for airports. Returning default data.');
        return self.emptyData;
      }

      var filteredAirports = _.filter(airportsJSON, function(airport) {
        return self.airportSearchInput() === airport.name;
      });

      var resultAirport = '';
      if(filteredAirports.length > 0) {
        resultAirport = filteredAirports[0];

        console.log('Airport.airportData: Found matching airport: ' + resultAirport.name);
      } else {
        console.log('Airport.airportData: No matching airport found.');
      }

      return resultAirport;
    },
    owner: self,
    deferEvaluation: true
  });
  
  self.airportCoords = ko.computed({
    read: function() {
      console.log('Airport.airportCoords: Recomputing airportCoords for ' + self.name);
      if(typeof self.airportData() === 'undefined' ||  typeof self.airportData().code === 'undefined' || self.airportData().code === '') {
        console.log('Airport.airportCoords: No airport supplied to airportCoords for ' + self.name + '!');
        return null;
      } else {
        var _LatLng = new google.maps.LatLng(parseFloat(self.airportData().lat, 10), parseFloat(self.airportData().lon, 10));
        console.log('Airport.airportCoords: New airportCoords for ' + self.name + ': ' + _LatLng);
        return _LatLng;
      }
    },
    owner: self
  });

  self.airportMarker = ko.computed({
    read: function() {
      console.log('Airport.airportMarker: Recomputing airportMarker for ' + self.name);
      if(typeof self.airportData() === 'undefined' ||  typeof self.airportData().code === 'undefined' || self.airportData().code === '') {
        console.log('Airport.airportMarker: No airport supplied to airportMarker for ' + self.name + '!');
        return null;
      } else {
        var _Marker = new google.maps.Marker({ position: self.airportCoords(), title: self.name});
        console.log('Airport.airportMarker: New airport Marker for ' + self.name + ': ' + _Marker.getPosition().lat() + ', ' + _Marker.getPosition().lng());
        return _Marker;
      }
    },
    owner: self
  });

};