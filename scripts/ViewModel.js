
MapIt.ViewModel = function(options) {
  var self = this;
  self.initialAirport = ko.observable();

  self.initialize = function() {
    self.departureSearchOptions = {
      source: self.departureSearchEngine().search.ttAdapter(),
      name: 'departureAirports',
      templates: {
          empty: [
            '<div class="empty-message">',
            'unable to find any Airports that match the search term',
            '</div>'
          ].join('\n'),
          suggestion: Handlebars.compile([
            '<div>',
            '<span class=\'typeahead-airport-name\'>{{name}} - ({{code}})</span>',
            '</div>',
            '<div>',
            '<span class=\'typeahead-airport-state\'>{{city}}, {{state}}</span> - <span class=\'typeahead-airport-country\'>{{country}}</span>',
            '</div>'
          ].join('\n')),
          header: '<h3>Select An Airport</h3>'
      },
      onOpened: self.onOpened,
      onSelected: self.onSelected,
      onAutoCompleted: self.onAutoCompleted,
      searchInputVal: self.departureSearchInput
    };
    self.arrivalSearchOptions = {
      source: self.arrivalSearchEngine().search.ttAdapter(),
      name: 'arrivalAirports',
      templates: {
          empty: [
            '<div class="empty-message">',
            'unable to find any Airports that match the search term',
            '</div>'
          ].join('\n'),
          suggestion: Handlebars.compile([
            '<div>',
            '<span class=\'typeahead-airport-name\'>{{name}} - ({{code}})</span>',
            '</div>',
            '<div>',
            '<span class=\'typeahead-airport-state\'>{{city}}, {{state}}</span> - <span class=\'typeahead-airport-country\'>{{country}}</span>',
            '</div>'
          ].join('\n')),
          header: '<h3>Select An Airport</h3>'
      },
      onOpened: self.onOpened,
      onSelected: self.onSelected,
      onAutoCompleted: self.onAutoCompleted,
      searchInputVal: self.arrivalSearchInput
    };

  };

  self.map = ko.observable(new google.maps.Map(document.getElementById('map-canvas'), {}));
  //var mgrOptions = { borderPadding: 50, maxZoom: 15, trackMarkers: true };
  //self.markerManager = ko.observable(new MarkerManager(self.map(), mgrOptions));
  self.airportCollection = ko.observableArray([]);
  self.bounds = ko.observable(new google.maps.LatLngBounds(null));
  self.flightPath = ko.observable(new google.maps.Polyline());

  self.departureSearchInput = ko.observable('');
  self.arrivalSearchInput = ko.observable('');
  self.departureSearchActive = ko.observable(false);
  self.arrivalSearchActive = ko.observable(false);

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
        self.addAirport(self.initialAirport());
        self.positionAndZoomToAirport(self.initialAirport());
      }
    }
  });

  self.isDepartureSelected = ko.observable(false);
  self.isArrivalSelected = ko.observable(false);

  self.departureSearchInput.subscribe(function(newDepartureSearchInput) {
    console.log('ViewModel.departureSearchInput.subscribe: I am subscribed to departureSearchInput right now.');
    console.log('ViewModel.departureSearchInput.subscribe: The new value of departureSearchInput is: <' + newDepartureSearchInput + '>');
    //self.airportCollection.remove(function(airport) { return airport.id === 1; }); // Removes item from collection of airports -- data
    self.departureSearchActive(true);
    self.isDepartureSelected(false);
  });


  self.arrivalSearchInput.subscribe(function(newArrivalSearchInput) {
    console.log('ViewModel.departureSearchInput.subscribe: I am subscribed to departureSearchInput right now.');
    console.log('ViewModel.departureSearchInput.subscribe: The new value of departureSearchInput is: <' + newArrivalSearchInput + '>');
    //self.airportCollection.remove(function(airport) { return airport.id === 2; }); // Removes item from collection of airports -- data
    self.arrivalSearchActive(true);
    self.isArrivalSelected(false);
  });

  self.departureSearchEngine = ko.observable(new MapIt.SearchEngine());
  self.arrivalSearchEngine = ko.observable(new MapIt.SearchEngine());

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

  /************ MAP RENDERING FUNCTIONS *************/

  self.addAirport = function(newAirport) {
    console.log('ViewModel.addAirportToMap: Adding airport to the airprotCollection with an id of ' + newAirport.id + '! Copying airport below --v');
    console.log(newAirport);
    self.airportCollection.push(newAirport);
    console.log('ViewModel.addAirportToMap: Added airport to collection with id of <' + newAirport.id + '>! New collection size: <' + self.airportCollection().length + '>');
    
    // If the marker is a proeprty of the airport and is always set to the map on creation, it might just work since it creates / destroys items from the array
    //self.airportCollection()[newAirport.id].marker.setPosition(airportModel.position);
    //self.airportCollection()[newAirport.id].marker.setMap(self.map());
  };

  self.removeAirport = function(airportModelToRemove) {
    self.airportCollection.remove(airportModelToRemove);
  };
  self.removeAirportById = function(idToRemove) {
    console.log('ViewModel.removeAirportById: Removing airport from collection with id of <' + idToRemove + '>. Current collection size: <' + self.airportCollection().length + '>');

    var airportToRemove;
    var airportToRemoveArray = _.filter(self.airportCollection(), function(airport) {
      return airport.id === idToRemove;
    });

    if(typeof airportToRemoveArray !== 'undefined' && airportToRemoveArray !== null && airportToRemoveArray.length > 0) {
      airportToRemove = airportToRemoveArray[0];
      console.log(airportToRemove);
      airportToRemove.airportMarker().setMap(null);
      self.airportCollection.remove(airportToRemove);
      console.log('ViewModel.removeAirportById: Airport <' + idToRemove + '> removed! Size of airportCollection is now <' + self.airportCollection().length + '>. Removed airport copied below --v');
    } else {
      console.log('ViewModel.removeAirportById: No airport was found to remove with id of <' + idToRemove + '>, copying data below that remove was attempted on --v');

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
      //console.log('ViewModel.getAirportById: Airport <' + idToRetrieve + '> retrieved! Added airport is copied below --v');
      //console.log(airportToReturn);
    } else {
      console.log('ViewModel.getAirportById: No airport was found with an id of <' + idToRetrieve + '>');
    }
    return airportToReturn;
  };

  self.removeMarkerFromMap = function(airportModel) {
    console.log('ViewModel.removeMarkerFromMap: Removing airport the map!');
    self.airportCollection()[airportModel.id].marker.setMap(null);
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
  self.positionAndZoomToMarker = function(marker) {
    self.map().setZoom(10);
    self.map().setCenter(marker.position);
  };
  self.positionAndZoomToPosition = function(position) {
    self.map().setZoom(10);
    self.map().setCenter(position);
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

/*
  // Define the typeahead options for both departure and arrival airports
  console.log('ViewModel: Defining typeahead options');
  var departureGenericTypeAheadOptions = {
    hint: true,
    highlight: true,
    //minLength: 2,
    source: self.departureSearchEngine().search.ttAdapter(),
    name: 'departureAirports',
    displayKey: 'value',
    engine: Handlebars,
    templates: {
      empty: [
        '<div class="empty-message">',
        'unable to find any Airports that match the search term',
        '</div>'
      ].join('\n'),
      suggestion: Handlebars.compile([
        '<div>',
        '<span class=\'typeahead-airport-name\'>{{name}} - ({{code}})</span>',
        '</div>',
        '<div>',
        '<span class=\'typeahead-airport-country\'>{{country}}</span>',
        '</div>'
      ].join('\n')),
      header: '<h3>Select An Airport</h3>'
    },
    updater: function(item) {
      console.log('ViewModel.departureTypeahead.Updater: Updater method for typeahead! Just returning item --v');
      console.log(item);
      return item;
    },
    highlighter: function (item) {
      console.log('ViewModel.departureTypeahead.Highlighter: Highlighting via regex and returning item.');
      var regex = new RegExp( '(' + this.query + ')', 'gi' );
      return item.replace( regex, '<stronger>$1</stronger>' );
    },
    response: function( event, ui ) {
      console.log('ViewModel.departureTypeahead.Response: Response method for typeahead! Returning true and logging event and ui --v');
      console.log(event);
      console.log(ui);
      return true;
    }
  };
  var arrivalGenericTypeAheadOptions = {
    hint: true,
    highlight: true,
    //minLength: 2,
    // `ttAdapter` wraps the suggestion engine in an adapter that
    // is compatible with the typeahead jQuery plugin
    source: self.arrivalSearchEngine().search.ttAdapter(),
    name: 'arrivalAirports',
    displayKey: 'value',
    engine: Handlebars,
    templates: {
      empty: [
        '<div class="empty-message">',
        'unable to find any Airports that match the search term',
        '</div>'
      ].join('\n'),
      suggestion: Handlebars.compile([
        '<div>',
        '<span class=\'typeahead-airport-name\'>{{name}} - ({{code}})</span>',
        '</div>',
        '<div>',
        '<span class=\'typeahead-airport-state\'>{{city}}, {{state}}</span> - <span class=\'typeahead-airport-country\'>{{country}}</span>',
        '</div>'
      ].join('\n')),
      header: '<h3>Select An Airport</h3>'
    },
    updater: function(item) {
      console.log('ViewModel.arrivalTypeahead.Updater: Updater method for typeahead! Just returning item --v');
      console.log(item);
      return item;
    },
    highlighter: function (item) {
      console.log('ViewModel.departureTypeahead.Highlighter: Highlighting via regex and returning item.');
      var regex = new RegExp( '(' + this.query + ')', 'gi' );
      return item.replace( regex, '<stronger>$1</stronger>' );
    },
    response: function( event, ui ) {
      console.log('ViewModel.departureTypeahead.Response: Response method for typeahead! Returning true and logging event and ui --v');
      console.log(event);
      console.log(ui);
      return true;
    }
  };*/

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

    console.log('ViewModel.onAutoCompleted: Stringifying, obj, then datum, then name: --v');
    console.log(JSON.stringify(obj)); // object
    // outputs, e.g., {"type":"typeahead:selected","timeStamp":1371822938628,"jQuery19105037956037711017":true,"isTrigger":true,"namespace":"","namespace_re":null,"target":{"jQuery19105037956037711017":46},"delegateTarget":{"jQuery19105037956037711017":46},"currentTarget":
    console.log(JSON.stringify(datum)); // contains datum value, tokens and custom fields
    // outputs, e.g., {"redirect_url":"http://localhost/test/topic/test_topic","image_url":"http://localhost/test/upload/images/t_FWnYhhqd.jpg","description":"A test description","value":"A test value","tokens":["A","test","value"]}
    // in this case I created custom fields called 'redirect_url', 'image_url', 'description'   
    console.log(JSON.stringify(name)); // contains dataset name
    // outputs, e.g., "my_dataset"
  };

  self.onOpened = function(obj, datum, name) {
    console.log('opened typeahead');
  };
/*
  // Initialize the typeahead search inputs
  console.log('ViewModel: Initializing typeaheads and binding typeahead events');

  
  options.domEls.departureSearch.typeahead(null, departureGenericTypeAheadOptions)//, departureSpecificTypeAheadOptions)
    .on('typeahead:opened', self.onOpened)
    .on('typeahead:selected', self.onSelected)
    .on('typeahead:autocompleted', self.onAutoCompleted);
  
  options.domEls.arrivalSearch.typeahead(null, arrivalGenericTypeAheadOptions)
    .on('typeahead:opened', self.onOpened)
    .on('typeahead:selected', self.onSelected)
    .on('typeahead:autocompleted', self.onAutoCompleted);
*/
  //Because I've bound both selected and autocompleted, do I need to do this
  //Because I think I read that one event is triggered by tab, and the other is triggered by enter
  //self.departureAirport().registerEnterKeyAutocomplete(options.domEls.departureSearch);
  //self.arrivalAirport().registerEnterKeyAutocomplete(options.domEls.arrivalSearch);

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