(function(ko, google, LatLon, MapIt) {
  'use strict';
  var _map;

  console.log('Got to the Airport.js file!');

  MapIt.Airport = function(map) {
    var self = this;
    _map = map;
  
    self.airportCoords = ko.observable();
    self.airportMarker = ko.observable();
    self.airportSearchInput = ko.observable();

    self.airportSearchBaseUrl = 'http://airports.pidgets.com/v1/airports/';
    self.airportSearchSuffix = '?format=json&callback=alert';

    self.airportSearchUrl = ko.computed(function () {
      var output = self.airportSearchBaseUrl + self.airportSearchInput() + self.airportSearchSuffix;
      console.log('Airport Search Url: ' + output);
      return output;
    });

    self.airportSearchInput.subscribe(function(newVal) {
      console.log('Executing subscribed function for change in airport search string');

      if (self.airportSearchInput() !== undefined && self.airportSearchInput().length > 0) {
        console.log('Executing airport search for new search string: ' + self.airportSearchInput());

        // DOES ANYTHING NEED TO BE DONE HERE??
      }
      else {
        console.log('Airport search did not execute, no input supplied');
      }
      return true;
    });

    self.airportData = ko.computed({
      read: function() {
        console.log('Reading input for airport, value is: "' + self.airportSearchInput() + '"');

        if(typeof airportsJSON === undefined || (self.airportSearchInput() !== undefined && self.airportSearchInput().length === 0)) {
          return self.emptyData;
        }

        var filteredAirports = _.filter(airportsJSON,function(airport) {
          return self.airportSearchInput() === airport.name;
        });

        var resultAirport = '';
        if(filteredAirports.length > 0) {
          resultAirport = filteredAirports[0];

          // If an airport is found, update the coordinates of the corresponding point on the map
          self.airportCoords(new google.maps.LatLng(parseInt(resultAirport.lat), parseInt(resultAirport.lon)));
          self.airportMarker(new google.maps.Marker({
            position: self.airportCoords(),
            title: 'Airport Marker'
          }));

          // Set the new coordinates on the map
          self.airportMarker().setMap(_map);

          console.log('Found matching airport: ' + resultAirport.name);
        } else {
          console.log('No matching airport found.');
        }


        return resultAirport;
      },
      owner: self,
      deferEvaluation: true
    });
    

  };

})(ko, google, LatLon, MapIt);