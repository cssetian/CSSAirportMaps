
MapIt.ViewModel = function(map) {
  var self = this;
  var _map;

  self.map = ko.observable(map);

  self.departureAirport = ko.observable(new MapIt.Airport(self._map, {name: 'Departure Airport'}));
  self.arrivalAirport = ko.observable(new MapIt.Airport(self._map, {name: 'Arrival Airport'}));

  self.airportSearchInput = ko.observable('');
  self.airportList = ko.observableArray([]);

  self.departureAirportUpdateHandler = function (newAirportData) {
    console.log('MapIt_App.init: Plotting new Departure Airport ' + newAirportData.name + ' at: (' + newAirportData.lat + ', ' + newAirportData.lon + ')');
    
    self.map.departurePosition(newAirportData());
  };

  self.arrivalAirportUpdateHandler = function (newAirportData) {
    if(typeof newAirportData === 'undefined' || typeof newAirportData.name === 'undefined') {
      console.log('MapIt_App.init: Plotting new Arrival Airport ' + newAirportData.name + ' at: (' + newAirportData.lat + ', ' + newAirportData.lon + ')');
      self.map.arrivalPosition(newAirportData);
    } else {
      console.log('MapIt_App.init: No Arrival Airport to plot!');
      self.map.arrivalPosition();
    }
  };

  self.departureAirport().airportData.subscribe(self.departureAirportUpdateHandler);
  console.log('MapIt_App.init: Map-updating callback function for departureAirport bound to departureAirport.airportData');

  self.arrivalAirport().airportData.subscribe(self.arrivalAirportUpdateHandler);
  console.log('MapIt_App.init: Map-updating callback function for arrialAirport bound to arrivalAirport.airportData');


  /*
  self.areTwoAirportsSelected = ko.computed(function() {
    if(typeof self.departureAirport() === 'undefined'                     || typeof self.arrivalAirport() === 'undefined' ||
       typeof self.departureAirport().airportData() === 'undefined'       || typeof self.arrivalAirport().airportData() === 'undefined' ||
       typeof self.departureAirport().airportData().lat === 'undefined'   || typeof self.arrivalAirort().airportData().lat === 'undefined'
      ) {
      return false;
    }
    return self.departureAirport().airportData().name !== '' && self.arrivalAirport().airportData().name !== '';
  });
  
  self.areTwoAirportsSelected.subscribe(function(twoPortsSelected) {
    var bounds = new google.maps.LatLngBounds ();
    if(twoPortsSelected() === true) {
      console.log('ViewModel.areTwoAirportsSelectedSubscribe: Two airports selected!');
    }
    else if(typeof self.departureAirport().airportCoords() !== undefined && self.departureAirport().airportCoords().length > 0) {
      _map.setCenter(self.departureAirport().airportCoords());
      console.log('Adding departure airport to map bounds');
    }
    if(typeof self.arrivalAirport().airportCoords() !== undefined && self.arrivalAirport().airportCoords().length > 0) {
      _map.setCenter(self.arrivalAirport().airportCoords());
      console.log('Adding arrival airport to map bounds');
    }

    map.fitBounds(bounds);
  });
  */

  self.distBtwnAirports = function(unit) {
    return ko.computed({
      read: function() {
        console.log('ViewModel.distBtwnAirports: Calculating the distance between airport 1: ' + self.departureAirport().airportData().name + ' and airport 2: ' + self.arrivalAirport().airportData().name);


        if(self.departureAirport().airportData() === self.emptyData || self.arrivalAirport().airportData() === self.emptyData) {
          console.log('ViewModel.distBtwnAirports: Error calculating distance: Make sure departure airport, arrival airport, and units are specified!');
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
          console.log('ViewModel.distBtwnAirports: No unit of length supplied, providing distance in Kilometers.');
        }
        var distanceToReturnTrimmed =  parseFloat(distanceToReturn).toFixed(0);
        
        // This is getting repeated multiple times because whenever departureAirport or arrivalAirport are updated/touched at all, this recomputes
        // That incldues the tests in the HTML where it checks to see if they exist before displaying the computed distances
        console.log('ViewModel.distBtwnAirports: Distance between ' + self.departureAirport().airportData().name + ' and ' + self.arrivalAirport().airportData().name + ' is approximately: ' + distanceToReturnTrimmed + ' ' + unit);
        
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

  //return { init: _init };
};
