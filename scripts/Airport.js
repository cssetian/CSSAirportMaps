//(function(ko, google, LatLon, MapIt) {
//  'use strict';
  var _map;

//  var MapIt = MapIt || {};
//  MapIt.Airport = MapIt.Airport || {};

  MapIt.Airport = function(map, options) {
    console.log('MapIt.Airport: Initializing Airport ViewModel');

    /******* Initialize Airport *******/
    var self = this;
    _map = map;

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
    /******** End Initialization ********/

    self.name = options.name;

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
        console.log('Reading input for airport, value is: "' + self.airportSearchInput() + '"');

        if(typeof airportsJSON === 'undefined' || typeof self.airportSearchInput() === 'undefined' || self.airportSearchInput().length === 0) {
          return self.emptyData;
        }

        var filteredAirports = _.filter(airportsJSON, function(airport) {
          return self.airportSearchInput() === airport.name;
        });

        var resultAirport = '';
        if(filteredAirports.length > 0) {
          resultAirport = filteredAirports[0];

          console.log('Found matching airport: ' + resultAirport.name);
        } else {
          console.log('No matching airport found.');
        }

        return resultAirport;
      },
      owner: self,
      deferEvaluation: true
    });
    
    self.airportCoords = ko.computed({
      read: function() {
        if(typeof self.airportData() === 'undefined' ||  typeof self.airportData().length === 'undefined') {
          return null;
        } else {
          return new google.maps.LatLng(parseInt(self.airportData().lat), parseInt(self.airportData().lon));
        }
      },
      owner: self
    });

    self.airportMarker = ko.computed({
      read: function() {
        if(typeof self.airportData() === 'undefined' ||  typeof self.airportData().length === 'undefined') {
          return null;
        } else {
          return new google.maps.Marker({ position: self.airportCoords(), title: self.name});
        }
      },
      owner: self
    });

    self.airportMarker.subscribe(function(newVal) {
          // Set the new coordinates on the map
      if(_map) {
        self.airportMarker()['map'] = _map;
      }
    });

  };

//})(ko, google, LatLon, MapIt);