
MapIt.ViewModel = function() {
  var self = this;

  self.map = ko.observable(new google.maps.Map(document.getElementById('map-canvas'), {}));

  self.airportSearchInput = ko.observable('');
  self.airportList = ko.observableArray([]);

  self.initialPosition = ko.observable();
  self.initialMarker = ko.computed({
    read: function() {
      console.log('MapModel.initialMarker: Recomputing initialMarker to: ' + self.initialPosition());
      var _initialMarker = new google.maps.Marker({
        position: self.initialPosition(),
        map: self.map()
      });
      return _initialMarker;
    }
  });

  // EXCEPTION BEING THROWN HERE BECAUSE POSITION SHOULD NO LONGER BE CONTAINED IN VIEWMODEL
  self.departureAirportUpdateHandler = function (newAirportData) {
    console.log('ViewModel.DepartureAirportUpdateHandler: Updated Departure Airport!');
    if(typeof newAirportData === 'undefined' || typeof newAirportData.name === 'undefined') {
      console.log('ViewModel.DeptUpdateHandler: No Departure Airport to plot!');
      self.departurePosition();
    } else {
      console.log('ViewModel.DeptUpdateHandler: Plotting new Departure Airport ' + newAirportData.name + ' at: (' + newAirportData.lat + ', ' + newAirportData.lon + ')');
      var _newDeparturePosition = new google.maps.LatLng(newAirportData.lat, newAirportData.lon);
      self.departurePosition(_newDeparturePosition);
    }
  };

  self.departureAirport = ko.observable(new MapIt.Airport(self.map(), {name: 'Departure Airport'}));
  self.departureAirport().airportMarker.subscribe(self.departureAirportUpdateHandler);
  /*
  self.departurePosition = ko.computed({
    read: function() {
      console.log('ViewModel.departurePosition: Recomputing departurePosition');
      if(typeof self.departureAirport() === 'undefined' ||
         typeof self.departureAirport().airportData === 'undefined' ||
         typeof self.departureAirport().airportData.name === 'undefined') {
        console.log('ViewModel.departurePosition: No Departure Airport to plot!');
        return '';
      } else {
        console.log('ViewModel.departurePosition: Computing new departure position for ' + self.departureAirport().airportData.name + ' at: (' + self.departureAirport().airportData.lat + ', ' + self.departureAirport().airportData.lon + ')');
        var _newDeparturePosition = new google.maps.LatLng(self.departureAirport().airportData.lat, self.departureAirport().airportData.lon);
        return _newDeparturePosition;
      }
    },
    owner: self
  });
  self.departureMarker = ko.computed({
    read: function() {
      console.log('ViewModel.departureMarker: Recomputing departureMarker to: ' + self.departurePosition());
      var _departureMarker =  new google.maps.Marker({
        position: self.departurePosition(),
        map: self.map()
      });
      return _departureMarker;
    },
    owner: self
  });
*/
  console.log('ViewModel: Map-updating callback function for departureAirport bound to departureAirport.airportData');

  self.arrivalAirport = ko.observable(new MapIt.Airport(self.map(), {name: 'Arrival Airport'}));
  self.arrivalAirport.subscribe(self.arrivalAirportUpdateHandler);
  self.arrivalPosition = ko.observable();
  console.log('ViewModel: Map-updating callback function for arrialAirport bound to arrivalAirport.airportData');

  self.arrivalAirportUpdateHandler = function (newAirportData) {
    if(typeof newAirportData === 'undefined' || typeof newAirportData.name === 'undefined') {
      console.log('ViewModel.ArrUpdateHandler: No Arrival Airport to plot!');
      self.arrivalPosition();
    } else {
      console.log('ViewModel.ArrUpdateHandler: Plotting new Arrival Airport ' + newAirportData.name + ' at: (' + newAirportData.lat + ', ' + newAirportData.lon + ')');
      var _newArrivalPosition = new google.maps.LatLng(newAirportData.lat, newAirportData.lon);
      self.arrivalPosition(_newArrivalPosition);
    }
  };

/*
  self.arrivalMarker = ko.computed({
    read: function() {
      console.log('MapModel.arrivalMarker: Recomputing arrivalMarker to: ' + self.arrivalPosition());
      var _arrivalMarker =  new google.maps.Marker({
        position: self.arrivalPosition(),
        map: self.map()
      });
      return _arrivalMarker;
    },
    owner: self
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
      },

      deferEvaluation: true
    }, this);
  };

/**********************************************************************************************************/


};
