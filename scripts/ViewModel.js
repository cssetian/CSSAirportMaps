
MapIt.ViewModel = function() {
  var self = this;

  self.map = ko.observable(new google.maps.Map(document.getElementById('map-canvas'), {}));

  self.mapMarkers = ko.observableArray([
    {id: 0, marker: new google.maps.Marker({map: self.map()})},
    {id: 1, marker: new google.maps.Marker({map: self.map()})},
    {id: 2, marker: new google.maps.Marker({map: self.map()})}
  ]);

  self.createMarker = function(id, position, map, markers) {
      var marker = new google.maps.Marker({ // create a marker and set id
          id: id,
          position: position,
          map: map
      });
      console.log('Adding marker ' + marker.id + ' at: ' + marker.position);
      markers[id].marker = marker; // cache created marker to markers object with id as its key
      return marker;
  }
  self.deleteMarker = function(id, markers) {
    var marker = markers[id]; // find the marker by given id
    console.log('Deleting marker ' + marker.id + ' at: ' + marker.position);
    marker.marker.setMap(null);
  }

  self.airportSearchInput = ko.observable('');
  self.airportList = ko.observableArray([]);

  self.initialPosition = ko.observable();
  /*
  self.initialMarker = ko.computed({
    read: function() {
      console.log('MapModel.initialMarker: Recomputing initialMarker to: ' + self.initialPosition());
      self.deleteMarker(0, self.mapMarkers());
      var _initialMarker = self.createMarker(0, self.initialPosition(), self.map(), self.mapMarkers());
      /*
      var _initialMarker = new google.maps.Marker({
        position: self.initialPosition()
      });
      self.mapMarkers()[0].marker.setPosition(self.initialPosition());
      */
     /*
      return _initialMarker;
    }
  });
*/

  // EXCEPTION BEING THROWN HERE BECAUSE POSITION SHOULD NO LONGER BE CONTAINED IN VIEWMODEL
  self.departureAirportUpdateHandler = function (newAirportMarker) {
    console.log('ViewModel.DepartureAirportUpdateHandler: Updated Departure Airport!');
    if(typeof newAirportMarker === 'undefined' || newAirportMarker === null || typeof newAirportMarker.title === 'undefined') {
      console.log('ViewModel.DeptUpdateHandler: No Departure Airport to plot!');
    } else {
      console.log('ViewModel.DeptUpdateHandler: Plotting new Departure Airport ' + newAirportMarker.title + ' at: (k: ' + newAirportMarker.position.k + ', A: ' + newAirportMarker.position.A + ')');
      var _newDeparturePosition = new google.maps.LatLng(newAirportMarker.position.A, newAirportMarker.position.k);
      //newAirportMarker.setMap(self.map());
      /*
      self.mapMarkers()[1].marker = new google.maps.Marker({position: _newDeparturePosition, map: self.map()});
      self.mapMarkers()[1].marker.setPosition(_newDeparturePosition);
      */
     /*
      self.deleteMarker(1, self.mapMarkers());
      self.createMarker(1, _newDeparturePosition, self.map(), self.mapMarkers());
      */
      self.mapMarkers()[1].marker.setPosition(newAirportMarker.position);
      self.map().panTo(newAirportMarker.position);
    }
  };

  self.departureAirport = ko.observable(new MapIt.Airport(self.map(), {name: 'Departure Airport'}));
  self.departureAirport().airportMarker.subscribe(self.departureAirportUpdateHandler);
  console.log('ViewModel: Map-updating callback function for departureAirport bound to departureAirport.airportData');

  self.arrivalAirportUpdateHandler = function (newAirportMarker) {
    console.log('ViewModel.ArrivalAirportUpdateHandler: Updated Arrival Airport!');
    if(typeof newAirportMarker === 'undefined' || newAirportMarker === null || typeof newAirportMarker.title === 'undefined') {
      console.log('ViewModel.ArrUpdateHandler: No Arrival Airport to plot!');
    } else {
      console.log('ViewModel.ArrUpdateHandler: Plotting new Arrival Airport ' + newAirportMarker.title + ' at: (k: ' + newAirportMarker.position.k + ', A: ' + newAirportMarker.position.A + ')');
      var _newArrivalPosition = new google.maps.LatLng(newAirportMarker.position.A, newAirportMarker.position.k);
      //newAirportMarker.setMap(self.map());
      //
      self.mapMarkers()[2].marker.setPosition(newAirportMarker.position);
      self.map().panTo(newAirportMarker.position);
    }
  };

  self.arrivalAirport = ko.observable(new MapIt.Airport(self.map(), {name: 'Arrival Airport'}));
  self.arrivalAirport().airportMarker.subscribe(self.arrivalAirportUpdateHandler);
  console.log('ViewModel: Map-updating callback function for arrialAirport bound to arrivalAirport.airportData');


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
