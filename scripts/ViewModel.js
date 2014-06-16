
MapIt.ViewModel = function(options) {
  var self = this;
  self.initialAirport = ko.observable();

  self.initialize = function() {
    self.departureSearchOptions = {
      //source: MapIt.SearchEngine.search,//self.departureSearchEngine().search.ttAdapter(),
      name: 'departureAirports',
      templates: MapIt.Config.typeahead_templates(),
      onOpened: self.onOpened,
      onSelected: self.onSelected,
      onAutoCompleted: self.onAutoCompleted,
      searchInputVal: self.departureSearchInput,
      remoteFilter: self.departureSearchEngine().remoteFilter
    };
    self.arrivalSearchOptions = {
      //source: MapIt.SearchEngine.search,//self.arrivalSearchEngine().search.ttAdapter(),
      name: 'arrivalAirports',
      templates: MapIt.Config.typeahead_templates(),
      onOpened: self.onOpened,
      onSelected: self.onSelected,
      onAutoCompleted: self.onAutoCompleted,
      searchInputVal: self.arrivalSearchInput,
      remoteFilter: self.arrivalSearchEngine().remoteFilter
    };

  };

  self.map = ko.observable(new google.maps.Map(document.getElementById('map-canvas'), {}));
  self.airportCollection = ko.observableArray([]);
  self.bounds = ko.observable(new google.maps.LatLngBounds(null));
  self.flightPath = ko.observable(new google.maps.Polyline());

  self.departureSearchInput = ko.observable('');
  self.arrivalSearchInput = ko.observable('');

  self.departureSearchEngine = ko.observable(new MapIt.SearchEngine({id: 1}));
  self.arrivalSearchEngine = ko.observable(new MapIt.SearchEngine({id: 2}));

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

  self.departureSearchInput.subscribe(function(newDepartureSearchInput) {
    console.log('ViewModel.departureSearchInput.subscribe: I am subscribed to departureSearchInput right now.');
    console.log('ViewModel.departureSearchInput.subscribe: The new value of departureSearchInput is: <' + newDepartureSearchInput + '>');
    
    self.departureSearchActive(true);
    self.isDepartureSelected(false);
  });


  self.arrivalSearchInput.subscribe(function(newArrivalSearchInput) {
    console.log('ViewModel.departureSearchInput.subscribe: I am subscribed to departureSearchInput right now.');
    console.log('ViewModel.departureSearchInput.subscribe: The new value of departureSearchInput is: <' + newArrivalSearchInput + '>');
    
    self.arrivalSearchActive(true);
    self.isArrivalSelected(false);
  });

  // BUILDS THE SEARCHABLE WORDS AND TOKENS FOR BLOODHOUND TO USE
  self.SearchText = ko.computed({
    read: function () {
      var searchableTerms = [];
      ko.utils.arrayForEach(self.departureAirport().airportSearchResults(), function (item) {
        searchableTerms.push(item.name);
      });
      console.log('SearchableTerms:');
      console.log(searchableTerms);
      return searchableTerms;
    },
    owner: self,
    deferEvaluation: true
  });

  /************ MAP-RENDERING AND STATE-MAINTAINING HELPER FUNCTIONS *************/

  self.addAirport = function(newAirport) {
    console.log('ViewModel.addAirportToMap: Adding airport to the airprotCollection with an id of ' + newAirport.id + '! Copying airport below --v');
    console.log(newAirport);
    
    self.airportCollection.push(newAirport);
    
    console.log('ViewModel.addAirportToMap: Added airport to collection with id of <' + newAirport.id + '>! New collection size: <' + self.airportCollection().length + '>');
    };

  self.removeAirportById = function(idToRemove) {
    console.log('ViewModel.removeAirportById: Removing airport from collection with id of <' + idToRemove + '>. Current collection size: <' + self.airportCollection().length + '>');

    var airportToRemove;
    var airportToRemoveArray = _.filter(self.airportCollection(), function(airport) {
      return airport.id === idToRemove;
    });

    if(typeof airportToRemoveArray !== 'undefined' && airportToRemoveArray !== null && airportToRemoveArray.length > 0) {
      airportToRemove = airportToRemoveArray[0];
      self.removeMarkerFromMap(airportToRemove);
      self.airportCollection.remove(airportToRemove);
      console.log('ViewModel.removeAirportById: Airport <' + idToRemove + '> removed! Size of airportCollection is now <' 
                      + self.airportCollection().length + '>. Removed airport copied below --v');
      console.log(airportToRemove);
    } else {
      console.log('ViewModel.removeAirportById: No airport was found to remove with id of <' 
                      + idToRemove + '>, copying data array below that was returned in removal search --v');
      console.log(airportToRemoveArray);
    }
    return airportToRemove;
  };

  self.getAirportById = function(idToRetrieve) {
    console.log('ViewModel.getAirportById: Retrieving airport with id: <' + idToRetrieve + '>');

    var airportToReturn;
    var airportToReturnArray = _.filter(self.airportCollection(), function(airport) {
      return airport.id === idToRetrieve;
    });

    if(typeof airportToReturnArray !== 'undefined' && airportToReturnArray !== null && airportToReturnArray.length > 0) {
      airportToReturn = airportToReturnArray[0];
    } else {
      console.log('ViewModel.getAirportById: No airport was found with an id of <' + idToRetrieve + '>');
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
    console.log('ViewModel.positionAndZoomToAirport: Moving map to the coordinates: <' + airport.airportMarker().position + '>');
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

  /****** TYPEAHEAD EVENT HANDLERS ******/

  self.onOpened = function(obj, datum, name) {
    console.log('opened typeahead');
  };
  
  self.onSelected = function(obj, datum, name) {
    console.log('ViewModel.onSelected: Typeahead ' + datum.name + ' was autocompleted!');
    console.log('ViewModel.onSelected: Data Results: --v');
    console.log(datum);

    self.removeAirportById(0);

    var newAirport = new MapIt.Airport(self.map(), {name: datum.name, id: datum.id, airportData: datum});
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
      console.log('ViewModel.onAutoCompleted: This should never get to this block of code, there will always be either 1, 2, or 0 mapMarkers on the map.');
    }

    //console.log('ViewModel.onSelected: Stringifying, obj, then datum, then name: --v');
    //console.log(JSON.stringify(obj)); // object
    // outputs, e.g., {"type":"typeahead:selected","timeStamp":1371822938628,"jQuery19105037956037711017":true,"isTrigger":true,"namespace":"","namespace_re":null,"target":{"jQuery19105037956037711017":46},"delegateTarget":{"jQuery19105037956037711017":46},"currentTarget":
    //console.log(JSON.stringify(datum)); // contains datum value, tokens and custom fields
    // outputs, e.g., {"redirect_url":"http://localhost/test/topic/test_topic","image_url":"http://localhost/test/upload/images/t_FWnYhhqd.jpg","description":"A test description","value":"A test value","tokens":["A","test","value"]}
    // in this case I created custom fields called 'redirect_url', 'image_url', 'description'   
    //console.log(JSON.stringify(name)); // contains dataset name
    // outputs, e.g., "my_dataset"
  };

  self.onAutoCompleted = function(obj, datum, name) {
    console.log('ViewModel.onAutoCompleted: Typeahead ' + datum.name + ' was autocompleted!');
    console.log('ViewModel.onAutoCompleted: Data Results: --v');
    console.log(datum);

    self.removeAirportById(0);

    var newAirport = new MapIt.Airport(self.map(), {name: datum.name, id: datum.id, airportData: datum});
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

    //console.log('ViewModel.onAutoCompleted: Stringifying, obj, then datum, then name: --v');
    //console.log(JSON.stringify(obj)); // object
    // outputs, e.g., {"type":"typeahead:selected","timeStamp":1371822938628,"jQuery19105037956037711017":true,"isTrigger":true,"namespace":"","namespace_re":null,"target":{"jQuery19105037956037711017":46},"delegateTarget":{"jQuery19105037956037711017":46},"currentTarget":
    //console.log(JSON.stringify(datum)); // contains datum value, tokens and custom fields
    // outputs, e.g., {"redirect_url":"http://localhost/test/topic/test_topic","image_url":"http://localhost/test/upload/images/t_FWnYhhqd.jpg","description":"A test description","value":"A test value","tokens":["A","test","value"]}
    // in this case I created custom fields called 'redirect_url', 'image_url', 'description'   
    //console.log(JSON.stringify(name)); // contains dataset name
    // outputs, e.g., "my_dataset"
  };

  self.distBtwnAirports = function(unit) {
    return ko.computed({
      read: function() {
        //console.log('ViewModel.distBtwnAirports: Calculating the distance between airport 1: ' 
        // + self.departureAirport().selectedSearchResultObj().name + ' and airport 2: ' 
        // + self.arrivalAirport().selectedSearchResultObj().name);
        if(!self.isDepartureSelected() || !self.isArrivalSelected()) {
          //console.log('ViewModel.distBtwnAirports: Error calculating distance: Make sure departure airport, arrival airport, and units are specified!');
          return '';
        }

        var p1 = new LatLon(self.getAirportById(1).airportData().lat, self.getAirportById(1).airportData().lng);
        var p2 = new LatLon(self.getAirportById(2).airportData().lat, self.getAirportById(2).airportData().lng);
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
        
        // This is getting repeated multiple times because whenever departureAirport or arrivalAirport are updated/touched at all, this recomputes
        // That incldues the tests in the HTML where it checks to see if they exist before displaying the computed distances
        //console.log('ViewModel.distBtwnAirports: Distance between ' + self.departureAirport().selectedSearchResultObj().name + ' and ' + self.arrivalAirport().selectedSearchResultObj().name + ' is approximately: ' + distanceToReturnTrimmed + ' ' + unit);
        var distanceToReturnTrimmed =  parseFloat(distanceToReturn).toFixed(2);
        return distanceToReturnTrimmed;
      },
      deferEvaluation: true
    }, this);
  };

};