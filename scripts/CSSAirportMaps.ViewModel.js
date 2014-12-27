
CSSAirportMaps.ViewModel = function(options) {
  var self = this;
  self.initialAirport = ko.observable();

  self.initialize = function() {

    // Define the specific unique data for each of the two search engines
    self.departureSearchOptions = {
      id: 1,
      name: 'departureAirports',
      templates: CSSAirportMaps.Config.typeaheadTemplates,
      onOpened: self.onOpened,
      onSelected: self.onSelected,
      onAutoCompleted: self.onAutoCompleted,
      searchInputVal: self.departureSearchInput
    };
    self.arrivalSearchOptions = {
      id: 2,
      name: 'arrivalAirports',
      templates: CSSAirportMaps.Config.typeaheadTemplates,
      onOpened: self.onOpened,
      onSelected: self.onSelected,
      onAutoCompleted: self.onAutoCompleted,
      searchInputVal: self.arrivalSearchInput
    };

    // Initialize each search engine with its specific name and id
    self.departureSearchEngine(new CSSAirportMaps.SearchEngine({id: self.departureSearchOptions.id, name: self.departureSearchOptions.name }));
    self.arrivalSearchEngine(new CSSAirportMaps.SearchEngine({id: self.arrivalSearchOptions.id, name: self.arrivalSearchOptions.name }));

    // Add the filter to the search options after initializing the search engines
    self.departureSearchOptions.remoteFilter = self.departureSearchEngine().remoteFilter;
    self.arrivalSearchOptions.remoteFilter = self.arrivalSearchEngine().remoteFilter;
  };

  self.map = ko.observable(new google.maps.Map(options.domEls.map.get(0), {})); // Define the map object on the map element provided
  self.airportCollection = ko.observableArray([]);  // Stores the airport objects for initial, departure, and arrival airports
  self.bounds = ko.observable(new google.maps.LatLngBounds(null)); // Define a map boundary object so it can be extended when airports are defined
  self.flightPath = ko.observable(new google.maps.Polyline());  // Defines a google maps polyline to be added / removed when both airports are selected

  self.departureSearchInput = ko.observable('');
  self.arrivalSearchInput = ko.observable('');

  self.departureSearchEngine = ko.observable();
  self.arrivalSearchEngine = ko.observable();

  self.departureSearchActive = ko.observable(false);
  self.arrivalSearchActive = ko.observable(false);

  self.isDepartureSelected = ko.observable(false);
  self.isArrivalSelected = ko.observable(false);

  self.departureSearchActive.subscribe(function(newVal) {
    console.log('ViewModel.departureSearchActive: ' + newVal);
    if(newVal === true) {
      if(self.getAirportById(1) !== undefined) {
        self.isDepartureSelected(false);
        self.removeAirportById(1);

        if(self.getAirportById(2) !== undefined) {
          self.removeFlightPathFromMap();
          self.positionAndZoomToAirport(self.getAirportById(2));
        }

        if(self.airportCollection().length === 0) {
          self.initialAirport().airportMarker().setMap(self.map());
          self.addAirport(self.initialAirport());
          self.positionAndZoomToAirport(self.initialAirport());
        }
      }
    }

  });
  self.arrivalSearchActive.subscribe(function(newVal) {
    console.log('ViewModel.arrivalSearchActive: ' + newVal);
    if(newVal === true) {
      if(self.getAirportById(2) !== undefined) {
        self.isArrivalSelected(false);
        self.removeAirportById(2);

        if(self.getAirportById(1) !== undefined) {
          self.removeFlightPathFromMap();
          self.positionAndZoomToAirport(self.getAirportById(1));
        }
      }

      if(self.airportCollection().length === 0) {
        self.initialAirport().airportMarker().setMap(self.map());
        self.addAirport(self.initialAirport());
        self.positionAndZoomToAirport(self.initialAirport());
      }
    }
  });

  // Update state variables when user begins departure airport search
  self.departureSearchInput.subscribe(function(newDepartureSearchInput) {
    console.log('ViewModel value update (departureSearchInput): (' + newDepartureSearchInput + ')');
    self.departureSearchActive(true);
    self.isDepartureSelected(false);
  });

  // Update state variables when user begins departure airport search
  self.arrivalSearchInput.subscribe(function(newArrivalSearchInput) {
    console.log('ViewModel value update (arrivalSearchInput): (' + newArrivalSearchInput + ')');
    self.arrivalSearchActive(true);
    self.isArrivalSelected(false);
  });

  /************ MAP-RENDERING AND STATE-MAINTAINING HELPER FUNCTIONS *************/

  self.addAirport = function(newAirport) {
    console.log('ViewModel.addAirport: Adding airport ' + newAirport.name + ': ', newAirport);
    self.airportCollection.push(newAirport);
    console.log('ViewModel.addAirport: Added airport with id of ' + newAirport.id + '. New collection size: ' + self.airportCollection().length + '.');
    };

  self.removeAirportById = function(idToRemove) {
    console.log('ViewModel.removeAirportById: Removing airport ' + idToRemove + ' from collection. Current collection size: ' + self.airportCollection().length);

    var airportToRemove;
    var airportToRemoveArray = _.filter(self.airportCollection(), function(airport) {
      return airport.id === idToRemove;
    });

    if(typeof airportToRemoveArray !== 'undefined' && airportToRemoveArray !== null && airportToRemoveArray.length > 0) {
      airportToRemove = airportToRemoveArray[0];
      self.removeMarkerFromMap(airportToRemove);
      self.airportCollection.remove(airportToRemove);
      console.log('ViewModel.removeAirportByid: Removing airport ' + idToRemove + '. Airport collection size is now ' + self.airportCollection().length);
    } else {
      console.log('ViewModel.removeAirportByid: Could not find airport with id' + idToRemove + '! Some kind of error happened.');
    }

    return airportToRemove;
  };

  self.getAirportById = function(idToRetrieve) {

    var airportToReturn;
    var airportToReturnArray = _.filter(self.airportCollection(), function(airport) {
      return airport.id === idToRetrieve;
    });

    if(typeof airportToReturnArray !== 'undefined' && airportToReturnArray !== null && airportToReturnArray.length > 0) {
      airportToReturn = airportToReturnArray[0];
    } else {
      console.log('ViewModel.getAirportById: No airport was found with an id of ' + idToRetrieve);
    }
    return airportToReturn;
  };

  self.removeMarkerFromMap = function(airportModel) {
    console.log('ViewModel.removeMarkerFromMap: Removing airport the map!');
    airportModel.airportMarker().setMap(null);
  };

  self.fitBounds = function() {
    self.bounds(new google.maps.LatLngBounds(null));
    ko.utils.arrayForEach(self.airportCollection(), function(airport) {
      self.bounds().extend(airport.airportMarker().position);
    });
  };

  self.panAndZoomToBounds = function() {
    self.map().fitBounds(self.bounds());
    self.map().panToBounds(self.bounds());
  };

  self.positionAndZoomToAirport = function(airport) {
    console.log('ViewModel.positionAndZoomToAirport: Moving map to the coordinates: ' + airport.airportMarker().position);
    self.map().setZoom(10);
    self.map().setCenter(airport.airportMarker().position);
  };

  self.addFlightPathToMap = function() {
    self.flightPath(new google.maps.Polyline({
      path: [self.getAirportById(1).airportMarker().position, self.getAirportById(2).airportMarker().position],
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2
    }));
    self.flightPath().setMap(self.map());
  };

  self.removeFlightPathFromMap = function() {
    self.flightPath().setMap(null);
  };

  /************* TYPEAHEAD EVENT HANDLERS *************/

  self.onOpened = function(obj, datum, name) {
    console.log('opened typeahead');
    if(!datum) {
      return;
    }
    if(datum.id === 1) {
      obj.typeahead("setQuery",self.departureSearchInput()).focus();
    } else if(datum.id === 2) {
      obj.typeahead("setQuery",self.arrivalSearchInput()).focus();
    } else {
      console.log('what is going on??');
    }
  };
  
  self.onSelected = function(obj, datum, name) {
    console.log('ViewModel.onSelected: Selected ' + datum.name + ': ', datum);

    self.removeAirportById(0);

    var newAirport = new CSSAirportMaps.Airport(self.map(), {name: datum.name, id: datum.id, airportData: datum});
    self.addAirport(newAirport);
    if(datum.id === 1) {
      self.isDepartureSelected(true);
      self.departureSearchActive(false);
    } else if (datum.id === 2) {
      self.isArrivalSelected(true);
      self.arrivalSearchActive(false);
    }

    if(self.airportCollection().length === 1) {
      self.removeFlightPathFromMap();

      self.positionAndZoomToAirport(newAirport);
    } else if (self.airportCollection().length == 2) {
      if(self.airportCollection()[0].name === self.airportCollection()[1].name) {
        return;
      }

      self.removeFlightPathFromMap();

      self.fitBounds();
      self.panAndZoomToBounds();
      self.addFlightPathToMap();
    } else {
      console.log('ViewModel.onAutoCompleted: This should never get to this block of code, there will always be either 1, 2, or 0 mapMarkers on the map.');
    }
  };

  self.onAutoCompleted = function(obj, datum, name) {
    console.log('ViewModel.onAutoCompleted: (' + datum.name + '): ', datum);

    self.removeAirportById(0);

    var newAirport = new CSSAirportMaps.Airport(self.map(), {name: datum.name, id: datum.id, airportData: datum});
    self.addAirport(newAirport);
    if(datum.id === 1) {
      self.isDepartureSelected(true);
      self.departureSearchActive(false);
    } else if (datum.id === 2) {
      self.isArrivalSelected(true);
      self.arrivalSearchActive(false);
    }

    if(self.airportCollection().length === 1) {
      self.removeFlightPathFromMap();

      self.positionAndZoomToAirport(newAirport);
    } else if (self.airportCollection().length == 2) {
      self.removeFlightPathFromMap();

      self.fitBounds();
      self.panAndZoomToBounds();
      self.addFlightPathToMap();
    } else {
      console.log('ViewModel.onAutoCompleted: Shouldn\'t really have gotten here...');
    }
  };

};