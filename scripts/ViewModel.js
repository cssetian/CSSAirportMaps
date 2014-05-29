//(function(ko, google, LatLon, MapItme, Airport) {
//  'use strict';

  var _map;

  MapIt.ViewModel = function(map) {
    var self = this;
    _map = map;
    self.departureAirport = ko.observable(new MapIt.Airport());
    self.arrivalAirport = ko.observable(new MapIt.Airport());
    console.log('Initializing ViewModel');


    // This is JSON so the quotes should stay as double quotes
    self.emptyData = {
      "code":"",
      "lat":"",
      "lon":"",
      "name":"",
      "city":"",
      "state":"",
      "country":"",
      "woeid":"",
      "tz":"",
      "phone":"",
      "type":"",
      "email":"",
      "url":"",
      "runway_length":"",
      "elev":"",
      "icao":"",
      "direct_flights":"",
      "carriers":""
    };

    //Maybe not needed.....
    //self.currentPoint = ko.observable();
    //


     // Subscribe to changes in the inputs so that the overall search input field can be updated and the dropdown automatically filters
     /*
    self.departureAirportInput = ko.observable();
    self.departureAirportCoords = ko.observable();
    self.departureAirportMarker = ko.observable();
    self.departureAirportInput.subscribe(function(newVal) {
      console.log('Executing subscribed function for change in Departure Airport search string');

      if (self.departureAirportInput() !== undefined && self.departureAirportInput().length > 0) {
        console.log('Executing Departure Airport search for new search string: ' + self.departureAirportInput());

        self.airportSearchInput(self.departureAirportInput());
        self.executingDepartureSearch(true);  // Doesn't really do anything right now...
      }
      else {
        console.log('Departure Airport search did not execute, no input supplied');
        self.airportSearchInput('');
      }
      return true;
    });
    self.selectedDepartureAirport = ko.computed({
      read: function() {
        console.log('Reading input for departure airport, value is: "' + self.departureAirportInput() + '"');

        if(typeof airportsJSON === undefined || (self.departureAirportInput() !== undefined && self.departureAirportInput().length === 0)) {
          return self.emptyData;
        }

        var filteredAirports = _.filter(airportsJSON,function(airport) {
          return self.departureAirportInput() === airport.name;
        });

        var resultAirport = '';
        if(filteredAirports.length > 0) {
          resultAirport = filteredAirports[0];

          // If an airport is found, update the coordinates of the corresponding point on the map
          self.departureAirportCoords(new google.maps.LatLng(parseInt(resultAirport.lat), parseInt(resultAirport.lon)));
          self.departureAirportMarker(new google.maps.Marker({
            position: self.departureAirportCoords(),
            title: 'Departure Airport'
          }));

          // Set the new coordinates on the map
          self.departureAirportMarker().setMap(_map);
          _map.setCenter(self.departureAirportCoords());

          console.log('Found matching airport: ' + resultAirport.name);
        } else {
          console.log('No matching airport found.');
        }


        return resultAirport;
      },
      owner: self,
      deferEvaluation: true
    });

    self.arrivalAirportInput = ko.observable();
    self.arrivalAirportCoords = ko.observable();
    self.arrivalAirportMarker = ko.observable();
    self.arrivalAirportInput.subscribe(function(newVal) {
      console.log('Executing subscribed function for change in Arrival Airport search string');

      if (self.arrivalAirportInput() !== undefined && self.arrivalAirportInput().length > 0) {
        console.log('Executing Arrival Airport search for new search string: ' + self.arrivalAirportInput());

        self.airportSearchInput(self.arrivalAirportInput());
        self.executingArrivalSearch(true);  // Doesn't really do anything right now...
      }
      else {
        console.log('Arrival Airport search did not execute, no input supplied');
        self.airportSearchInput('');
      }
      return true;
    });

    self.selectedArrivalAirport = ko.computed({
      read: function() {
        console.log('Reading input for arrival airport, value is: "' + self.arrivalAirportInput() + '"');

        if(typeof airportsJSON === undefined || (self.arrivalAirportInput() !== undefined && self.arrivalAirportInput().length === 0)) {
          return self.emptyData;
        }

        var filteredAirports = _.filter(airportsJSON,function(airport) {
          return self.arrivalAirportInput() === airport.name;
        });

        var resultAirport = '';
        if(filteredAirports.length > 0) {
          resultAirport = filteredAirports[0];

          self.arrivalAirportCoords(new google.maps.LatLng(parseInt(resultAirport.lat), parseInt(resultAirport.lon)));
          self.arrivalAirportMarker(new google.maps.Marker({
            position: self.arrivalAirportCoords(),
            title: 'Arrival Airport'
          }));

          self.arrivalAirportMarker().setMap(_map);
          _map.setCenter(self.arrivalAirportCoords());

          console.log('Found matching airport: ' + resultAirport.name);
        } else {
          console.log('No matching airport found.');
        }

        return resultAirport;
      },
      owner: self,
      deferEvaluation: true
    });


    self.areTwoAirportsSelected = ko.computed(function() {
      return self.selectedArrivalAirport().name !== '' && self.selectedDepartureAirport().name !== '';
    });

    self.areTwoAirportsSelected.subscribe(function(twoPortsSelected) {
      var bounds = new google.maps.LatLngBounds ();

      if(typeof self.departureAirportCoords() !== undefined && self.departureAirportCoords().length > 0) {
        _map.setCenter(self.departureAirportCoords());
        console.log('Adding departure airport to map bounds');
      }
      if(typeof self.arrivalAirportCoords() !== undefined && self.arrivalAirportCoords().length > 0) {
        _map.setCenter(self.arrivalAirportCoords());
        console.log('Adding arrival airport to map bounds');
      }

      map.fitBounds(bounds);
    });
*/
    self.areTwoAirportsSelected = ko.computed(function() {
      return self.departureAirport().airportData().name !== '' && self.arrivalAirport().airportData().name !== '';
    });

    self.areTwoAirportsSelected.subscribe(function(twoPortsSelected) {
      var bounds = new google.maps.LatLngBounds ();

      if(typeof self.departureAirport().airportCoords() !== undefined && self.departureAirport().airportCoords().length > 0) {
        _map.setCenter(self.departureAirport().airportCoords());
        console.log('Adding departure airport to map bounds');
      }
      if(typeof self.arrivalAirport().airportCoords() !== undefined && self.arrivalAirport().airportCoords().length > 0) {
        _map.setCenter(self.arrivalAirport().airportCoords());
        console.log('Adding arrival airport to map bounds');
      }

      map.fitBounds(bounds);
    });


    self.airportSearchInput = ko.observable('');
    self.airportList = ko.observableArray();

    /*
    self.executingDepartureSearch = ko.observable(false);
    self.executingArrivalSearch = ko.observable(false);

    // http://airports.pidgets.com/v1/airports?format=json
    self.departureAirportBaseUrl = 'http://airports.pidgets.com/v1/airports/';
    self.arrivalAirportBaseUrl = 'http://airports.pidgets.com/v1/airports/';
    self.airportUrlSuffix = '?format=json&callback=alert';

    self.departureAirportSearchUrl = ko.computed(function () {
      var output = self.departureAirportBaseUrl + self.departureAirportInput() + self.airportUrlSuffix;
      console.log('Departure Airport Search Url: ' + output);
      return output;
    });
    self.arrivalAirportSearchUrl = ko.computed(function () {
      var output = self.arrivalAirportBaseUrl + self.arrivalAirportInput() + self.airportUrlSuffix;
      console.log('Arrival Airport Search Url: ' + output);
      return output;
    });
    */
   /*
    self.distBtwnAirports = function(unit) {
      return ko.computed({
        read: function() {
          console.log('Calculating the distance between airport 1: ' + self.selectedDepartureAirport().name + ' and airport 2: ' + self.selectedArrivalAirport().name);


          if(self.selectedDepartureAirport() === self.emptyData || self.selectedArrivalAirport() === self.emptyData) {
            console.log('Error calculating distance: Make sure departure airport, arrival airport, and units are specified!');
            return '';
          }

          var p1 = new LatLon(self.selectedDepartureAirport().lat, self.selectedDepartureAirport().lon);
          var p2 = new LatLon(self.selectedArrivalAirport().lat, self.selectedArrivalAirport().lon);
          var dist = p1.distanceTo(p2);

          var distanceToReturn = dist;
          if(unit === 'M') {
            distanceToReturn = dist * 0.621371;
          } else if (unit === 'NM') {
            distanceToReturn = dist * 0.539957;
          } else if (unit === 'Km') {
            distanceToReturn = dist;
          } else {
            console.log('No unit of length supplied, providing distance in Kilometers.');
          }
          var distanceToReturnTrimmed =  parseFloat(distanceToReturn).toFixed(0);
          
          // This is getting repeated multiple times because whenever departureAirport or arrivalAirport are updated/touched at all, this recomputes
          // That incldues the tests in the HTML where it checks to see if they exist before displaying the computed distances
          console.log('Distance between ' + self.selectedDepartureAirport().name + ' and ' + self.selectedArrivalAirport().name + ' is approximately: ' + distanceToReturnTrimmed + ' ' + unit);
          
          return distanceToReturnTrimmed;

          // Sample usage of LatLon from an API example
          //   var p1 = new LatLon(51.5136, -0.0983);                                                      
          //   var p2 = new LatLon(51.4778, -0.0015);                                                      
          //   var dist = p1.distanceTo(p2);          // in km                                             
          //   var brng = p1.bearingTo(p2);           // in degrees clockwise from north   
        },

        deferEvaluation: true
      }, this);
    };*/


    self.distBtwnAirports = function(unit) {
      return ko.computed({
        read: function() {
          console.log('Calculating the distance between airport 1: ' + self.departureAirport().airportData().name + ' and airport 2: ' + self.arrivalAirport().airportData().name);


          if(self.departureAirport().airportData() === self.emptyData || self.arrivalAirport().airportData() === self.emptyData) {
            console.log('Error calculating distance: Make sure departure airport, arrival airport, and units are specified!');
            return '';
          }

          var p1 = new LatLon(self.departureAirport().airportData().lat, self.departureAirport().airportData().lon);
          var p2 = new LatLon(self.arrivalAirport().airportData().lat, self.arrivalAirport().airportData().lon);
          var dist = p1.distanceTo(p2);

          var distanceToReturn = dist;
          if(unit === 'M') {
            distanceToReturn = dist * 0.621371;
          } else if (unit === 'NM') {
            distanceToReturn = dist * 0.539957;
          } else if (unit === 'Km') {
            distanceToReturn = dist;
          } else {
            console.log('No unit of length supplied, providing distance in Kilometers.');
          }
          var distanceToReturnTrimmed =  parseFloat(distanceToReturn).toFixed(0);
          
          // This is getting repeated multiple times because whenever departureAirport or arrivalAirport are updated/touched at all, this recomputes
          // That incldues the tests in the HTML where it checks to see if they exist before displaying the computed distances
          console.log('Distance between ' + self.departureAirport().airportData().name + ' and ' + self.arrivalAirport().airportData().name + ' is approximately: ' + distanceToReturnTrimmed + ' ' + unit);
          
          return distanceToReturnTrimmed;

          // Sample usage of LatLon from an API example
          //   var p1 = new LatLon(51.5136, -0.0983);                                                      
          //   var p2 = new LatLon(51.4778, -0.0015);                                                      
          //   var dist = p1.distanceTo(p2);          // in km                                             
          //   var brng = p1.bearingTo(p2);           // in degrees clockwise from north   
        },

        deferEvaluation: true
      }, this);
    };

    // private helpers
    var _resetDepartureSearch = function () {
      self.executingDepartureSearch(false);
      self.departureAirportInput('');
    };
    var _resetArrivalSearch = function () {
      self.executingArrivalSearch(false);
      self.arrivalAirportInput('');
    };

};
//})(ko, google, LatLon, MapIt);