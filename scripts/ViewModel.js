
MapIt.ViewModel = function() {
  var self = this;

  self.map = ko.observable(new google.maps.Map(document.getElementById('map-canvas'), {}));

  // Initialize an array of map markers to keep track of all 3 markers on the map.
  // Google Maps API does not automatically keep track of and clean up markers on a map.
  // That must be done manually by either updating existing markers' positions or remove/readding them.
  self.mapMarkers = ko.observableArray([
    {id: 0, marker: new google.maps.Marker({map: self.map()})},
    {id: 1, marker: new google.maps.Marker({map: self.map()})},
    {id: 2, marker: new google.maps.Marker({map: self.map()})}
  ]);

  self.airportSearchInput = ko.observable('');
  self.airportList = ko.observableArray([]);

  self.initialPosition = ko.observable();

  // EXCEPTION BEING THROWN HERE BECAUSE POSITION SHOULD NO LONGER BE CONTAINED IN VIEWMODEL
  self.departureAirportUpdateHandler = function (newAirportMarker) {
    console.log('ViewModel.DepartureAirportUpdateHandler: Updated Departure Airport!');
    if(typeof newAirportMarker === 'undefined' || newAirportMarker === null || typeof newAirportMarker.title === 'undefined') {
      console.log('ViewModel.DeptUpdateHandler: No Departure Airport to plot!');
    } else {
      console.log('ViewModel.DeptUpdateHandler: Plotting new Departure Airport ' + newAirportMarker.title + ' at: (k: ' + newAirportMarker.position.k + ', A: ' + newAirportMarker.position.A + ')');
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
