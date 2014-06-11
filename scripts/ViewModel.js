
MapIt.ViewModel = function(options) {
  var self = this;

  self.dummyAirportSearches =  ko.observableArray([
        'Angular',
        'Canjs',
        'Batman',
        'Meteor',
        'Ember',
        'Backbone',
        'Knockout',
        'Knockback',
        'Spine',
        'Sammy',
        'YUI',
        'Closure',
        'jQuery']);

  self.map = ko.observable(new google.maps.Map(document.getElementById('map-canvas'), {}));
  self.bounds = ko.observable(new google.maps.LatLngBounds(null));
  self.airportList = ko.observableArray([]);
  self.initialCoords = ko.observable();
  self.initialMarker = ko.computed({
    read: function () {
      console.log('initialCoords.initialMarker: Recomputing airportMarker for initialCoords');
      if(typeof self.initialCoords() === 'undefined' || self.initialCoords() === null || self.initialCoords() === '') {
        console.log('No initialCoords provided');
        return null;
      } else {
        var _Marker = new google.maps.Marker({ position: self.initialCoords(), title: 'Let\'s plot some maps!'});
        console.log('initialCoords.initialMarker: New Marker for initialCoords: ' + _Marker.getPosition().lat().toFixed(2) + ', ' + _Marker.getPosition().lng().toFixed(2));
        return _Marker;
      }
    },
    owner: self,
    deferEvaluation: true
  });
  self.flightPath = ko.observable(new google.maps.Polyline());
  self.clientSearchResults = ko.mapping.fromJS([]);

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
  // Initialize an array of map markers to keep track of all 3 markers on the map.
  // Google Maps API does not automatically keep track of and clean up markers on a map.
  // That must be done manually by either updating existing markers' positions or remove/readding them.
  self.mapMarkers = ko.observable([
    {id: 0, marker: new google.maps.Marker({map: self.map()})},
    {id: 1, marker: new google.maps.Marker({map: self.map()})},
    {id: 2, marker: new google.maps.Marker({map: self.map()})}
  ]);

  console.log('ViewModel: Defining marker rendering helper and main functions');
  self.displaySingleMarkerOnMap = function(newMarker, idx) {
    console.log('ViewModel.displaySingleMarkerOnMap: Displaying single marker!');
    self.flightPath().setMap(null);

    var i;
    for(i = 0; i < self.mapMarkers().length; i++) {
      if(i === idx) {
        console.log('ViewModel.displaySingleMarkerOnMap: Displaying marker #' + i);
        self.mapMarkers()[i].marker.setPosition(newMarker.position);
        self.mapMarkers()[i].marker.setMap(self.map());
      } else {
        self.mapMarkers()[i].marker.setMap(null);
      }
    }
      console.log('ViewModel.displaySingleMarkerOnMap: Centering on coordinate at ' + self.mapMarkers()[idx].marker.position);
      self.map().setZoom(10);
      self.map().setCenter(self.mapMarkers()[idx].marker.position);
  };

  self.displayTwoAirportsAndRouteOnMap = function(newMarker1, newMarker2, idx1, idx2) {
    console.log('ViewModel.displayTwoAirportsAndRouteOnMap: Two airports are selected! Add flight path to map!');
    self.flightPath().setMap(null);

    var i;
    for(i = 0; i < self.mapMarkers().length; i++) {
      if(i === idx1) {
        self.mapMarkers()[i].marker.setPosition(newMarker1.position);
        self.mapMarkers()[i].marker.setMap(self.map());
      } else if(i === idx2) {
        self.mapMarkers()[i].marker.setPosition(newMarker2.position);
        self.mapMarkers()[i].marker.setMap(self.map());
      } else {
        self.mapMarkers()[i].marker.setMap(null);
      }
    }
  
    self.flightPath(new google.maps.Polyline({
      path: [self.departureAirport().airportCoords(), self.arrivalAirport().airportCoords()],
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2
    }));
    self.flightPath().setMap(self.map());

    console.log('ViewModel.displayTwoAirportsAndRouteOnMap: Setting view bounds on map to both markers + flight path');
    self.bounds(new google.maps.LatLngBounds(null));
    self.bounds().extend(self.departureAirport().airportCoords());
    self.bounds().extend(self.arrivalAirport().airportCoords());
    console.log('ViewModel.displayTwoAirportsAndRouteOnMap: new bounds: ' + self.bounds());
    self.map().fitBounds(self.bounds());
    self.map().panToBounds(self.bounds());
  };

  self.renderMapMarkers = function(newAirportMarker) {
    if(newAirportMarker === null) {
      // Handle removing an airportMarker from the map
      if(self.departureAirport().airportData() === self.departureAirport().emptyData && self.arrivalAirport().airportData() === self.arrivalAirport().emptyData) {
        self.displaySingleMarkerOnMap(self.initialMarker(), 0);
      } else if(self.departureAirport().airportMarker() === null) {//self.departureAirport().emptyData) {
        self.displaySingleMarkerOnMap(self.arrivalAirport().airportMarker(), 1);
      } else if(self.arrivalAirport().airportMarker() === null) {//self.arrivalAirport().emptyData) {
        self.displaySingleMarkerOnMap(self.departureAirport().airportMarker(), 2);
      } else {
        console.log('App really shouldn\'t have gotten here..... there\'s no combination of logic that would yield this result...');
      }
    } else {
      // Handle an airportMarker being added to the map
      if(self.departureAirport().airportData() !== self.departureAirport().emptyData && self.arrivalAirport().airportData() !== self.arrivalAirport().emptyData) {
        self.displayTwoAirportsAndRouteOnMap(self.departureAirport().airportMarker(), self.arrivalAirport().airportMarker(), 1, 2);
      } else if(self.departureAirport().airportMarker() === newAirportMarker) {
        self.displaySingleMarkerOnMap(newAirportMarker, 1);
      } else if(self.arrivalAirport().airportMarker() === newAirportMarker) {
        self.displaySingleMarkerOnMap(newAirportMarker, 2);
      } else {
        console.log('App really shouln\'t have gotten here...... there\'s no combination of logic that would yield this result....');
      }
    }
  };

  // Bind airportMarker events so that viewModel map markers are updated and rerendered on the map
  console.log('ViewModel: Setting DepartureAirport subscribe callback function bound to departureAirport.airportData');
  self.departureAirport = ko.observable(new MapIt.Airport(self.map(), {name: 'Departure Airport'})).extend({ rateLimit: 0 });
  self.departureAirport().airportMarker.subscribe(self.renderMapMarkers);

  console.log('ViewModel: Setting ArrivalAirport subscribe callback function bound to arrivalAirport.airportData');
  self.arrivalAirport = ko.observable(new MapIt.Airport(self.map(), {name: 'Arrival Airport'})).extend({ rateLimit: 0 });
  self.arrivalAirport().airportMarker.subscribe(self.renderMapMarkers);

  self.remoteFilter = function(airports) {
    console.log('****************************EXECUTED AIRPORT SEARCH (' + self.name + ') ************************************');
    console.log('Bloodhound.remote.filter: Found some airports! ---v');
    console.log(airports);

    var mappedOutput = $.map(airports.geonames, function (airport) {
      var _IATACode = _.filter(airport.alternateNames, function(item) { return item.lang === 'iata'; });
      var _filteredIATACode = '';
      if(typeof _IATACode !== 'undefined' && _IATACode.length > 0) {
        _filteredIATACode = _IATACode[0].name;
      }
          
      return {
        value: airport.toponymName,
        name: airport.toponymName,
        lat: airport.lat,
        lng: airport.lng,
        city: airport.adminName1,
        country: airport.countryName,
        countryCode: airport.countryCode,
        adminId1: airport.adminId1,
        geoNameId: airport.geonameId,
        timeZone: airport.timezone,
        code: _filteredIATACode
      };
    });

    if(typeof mappedOutput === 'undefined' || mappedOutput === null || mappedOutput.length < 1) {
      console.log('Bloodhound.remote.filter: No airports found. Resetting data to emptyData');
      self.departureAirport().extenderSearchResults(null);
    } else {
      console.log('Bloodhound.remote.filter: Airports found! Setting data to retrieved results');
      self.departureAirport().extenderSearchResults(mappedOutput.geonames);
    }

    console.log('Bloodhound.remote.filter: Mapped Output --v');
    console.log(mappedOutput);
    return mappedOutput;
  };

  // Define the options for bloodhound and typeahead inputs
  console.log('ViewModel: Defining bloodhound initialization options');
  var bloodhoundOptions = {
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
      //return arr.concat(Bloodhound.tokenizers.whitespace(d.name), Bloodhound.tokenizers.whitespace(d.city), Bloodhound.tokenizers.whitespace(d.country), Bloodhound.tokenizers.whitespace(d.code));
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    limit: 20,
    log_successful_searches: true,
    log_failed_searches: true,
    remote: {
      url: 'http://api.geonames.org/searchJSON?style=full&lang=en&maxRows=20&featureClass=S&featureCode=AIRP&username=cssetian&orderby=relevance&name=%QUERY',
      filter: self.remoteFilter, /*function (airports) {
      console.log('****************************EXECUTED AIRPORT SEARCH (' + self.name + ') ************************************');
        console.log('Bloodhound.remote.filter: Found some airports! ---v');
        console.log(airports);

        var mappedOutput = $.map(airports.geonames, function (airport) {
          var _IATACode = _.filter(airport.alternateNames, function(item) { return item.lang === 'iata'; });
          var _filteredIATACode = '';
          if(typeof _IATACode !== 'undefined' && _IATACode.length > 0) {
            _filteredIATACode = _IATACode[0].name;
          }
              
          return {
            value: airport.toponymName,
            name: airport.toponymName,
            lat: airport.lat,
            lng: airport.lng,
            city: airport.adminName1,
            country: airport.countryName,
            countryCode: airport.countryCode,
            adminId1: airport.adminId1,
            geoNameId: airport.geonameId,
            timeZone: airport.timezone,
            code: _filteredIATACode
          };
        });

        if(typeof mappedOutput === 'undefined' || mappedOutput === null || mappedOutput.length < 1) {
          console.log('Bloodhound.remote.filter: No airports found. Resetting data to emptyData');
          self.departureAirport().extenderSearchResults(null);
        } else {
          console.log('Bloodhound.remote.filter: Airports found! Setting data to retrieved results');
          self.departureAirport().extenderSearchResults(mappedOutput.geonames);
        }

        console.log('Bloodhound.remote.filter: Mapped Output --v');
        console.log(mappedOutput);
        return mappedOutput;
      }*/
    }
  };

  // Initialize the Bloodhound search engine
  console.log('ViewModel: Initializing Bloodhound engine');
  var airportSearch = new Bloodhound(bloodhoundOptions);
  var searchPromise = airportSearch.initialize();
  searchPromise.done(function() { console.log('success!'); })
               .fail(function() { console.log('err!'); });

  // Define the typeahead options for both departure and arrival airports
  console.log('ViewModel: Defining typeahead options');
  var departureGenericTypeAheadOptions = {
    hint: true,
    highlight: true,
    minLength: 2,
    updater: function(item) {
      console.log('TypeAhead.DepartureAirportSelector.Updater: Updated typeahead serach term! Setting viewmodel search term.');
      console.log(item);
      self.departureAirport().airportSearchTerm(item.value);
      self.departureAirport().extenderSearchResults();
      return item;
    },
    highlighter: function (item) {
      var regex = new RegExp( '(' + this.query + ')', 'gi' );
      return item.replace( regex, '<stronger>$1</stronger>' );
    }
  };
  var departureSpecificTypeAheadOptions = {
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
        '<span class=\'typeahead-airport-state\'>{{city}}, {{state}}</span> - <span class=\'typeahead-airport-country\'>{{country}}</span>',
        '</div>'
      ].join('\n')),
      header: '<h4>Airports</h4>'
    },
    // `ttAdapter` wraps the suggestion engine in an adapter that
    // is compatible with the typeahead jQuery plugin
    source: airportSearch.ttAdapter()
  };
  var arrivalGenericTypeAheadOptions = {
    hint: true,
    highlight: true,
    minLength: 2,
    updater: function(item) {
      console.log('TypeAhead.ArrivalAirportSelector.Updater: Updated typeahead serach term! Setting viewmodel search term.');
      console.log(item);
      self.arrivalAirport().airportSearchTerm(item.value);
      return item;
    },
    highlighter: function (item) {
      var regex = new RegExp( '(' + this.query + ')', 'gi' );
      return item.replace( regex, '<stronger>$1</stronger>' );
    }
  };
  var arrivalSpecificTypeAheadOptions = {
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
      header: '<h3>Airports</h3>'
    },
    // `ttAdapter` wraps the suggestion engine in an adapter that
    // is compatible with the typeahead jQuery plugin
    source: airportSearch.ttAdapter()
  };

  console.log('ViewModel: Initializing typeaheads');
  // Initialize the typeahead search inputs
  options.domEls.departureSearch.typeahead(departureGenericTypeAheadOptions, departureSpecificTypeAheadOptions);
  options.domEls.arrivalSearch.typeahead(arrivalGenericTypeAheadOptions, arrivalSpecificTypeAheadOptions);

  function onOpened($e) {
    console.log('opened');
  }

  function onAutocompleted($e, datum) {
      //Only fires whenever you search for an item and hit tab or enter to autocomplete to the first suggested result
    console.log('autocompleted');
    console.log(datum);
  }

  function onSelected($e, datum) {
      //Fires when you select one of the options in the autocomplete either with the mouse or using the arrow keys and tab/enter
    console.log('selected');
    console.log(datum);

    
  }

  function registerEnterKeyAutocomplete(typeAheadEl) {
    typeAheadEl.on('keydown', function(event) {
      // Define tab key
      var e = jQuery.Event('keydown');
      e.keyCode = e.which = 9; // 9 == tab
      
      if (event.which === 13) {// if pressing enter
        typeAheadEl.trigger(e); // trigger "tab" key - which works as "enter"
      }
    })
    .on('typeahead:opened', onOpened)
    .on('typeahead:selected', onSelected)
    .on('typeahead:autocompleted', onAutocompleted);
  }

  registerEnterKeyAutocomplete(options.domEls.departureSearch);
  registerEnterKeyAutocomplete(options.domEls.arrivalSearch);


  /********************** Airport Existance Conditions and Helpers **********************/
  self.departureAirportSelected = ko.computed({
    read: function() {
      var _departureAirportSelected = (self.departureAirport().airportData() !== self.departureAirport().emptyData);
      console.log('DepartureAirportSelected: ' + _departureAirportSelected);
      return _departureAirportSelected;
    },
    owner: self
  }).extend({ rateLimit: 0 });
  self.arrivalAirportSelected = ko.computed({
    read: function() {
      var _arrivalAirportSelected = (self.arrivalAirport().airportData() !== self.arrivalAirport().emptyData);
      console.log('ArrivalAirportSelected: ' + _arrivalAirportSelected);
      return _arrivalAirportSelected;
    },
    owner: self
  }).extend({ rateLimit: 0 });
  self.anyAirportSelected = ko.computed({
    read: function() {
      var _anyAirportSelected = (self.departureAirportSelected() || self.arrivalAirportSelected());
      console.log ('AnyAirportSelected: ' + _anyAirportSelected);
      return _anyAirportSelected;
    },
    owner: self
  }).extend({ rateLimit: 0 });
  self.twoAirportsSelected = ko.computed({
    read: function() {
      var _bothAirportsSelected = (self.arrivalAirportSelected() && self.departureAirportSelected());
      console.log('BothAirportsSelected: ' + _bothAirportsSelected);
      return _bothAirportsSelected;
    },
    owner: self
  }).extend({ rateLimit: 0 });

  self.oneAirportSelected = ko.computed({
    read: function() {
      var _oneAirportSelected = ((self.arrivalAirportSelected() || self.departureAirportSelected()) && !(self.departureAirportSelected() && self.arrivalAirportSelected()));
      console.log('OneAirportSelected: ' + _oneAirportSelected);
      return _oneAirportSelected;
    },
    owner: self
  }).extend({ rateLimit: 0 });
  /****************************************************************************************/

  self.twoAirportsSelected.subscribe(function(newVal){
    if(newVal === true) {
      console.log('ViewModel.twoAirportsSelectedSusbscriber: Two airports are selected! Add flight path to map!');
    }
  });

  self.distBtwnAirports = function(unit) {
    return ko.computed({
      read: function() {
        //console.log('ViewModel.distBtwnAirports: Calculating the distance between airport 1: ' 
        // + self.departureAirport().airportData().name + ' and airport 2: ' 
        // + self.arrivalAirport().airportData().name);
        if(!self.twoAirportsSelected()) {
          //console.log('ViewModel.distBtwnAirports: Error calculating distance: Make sure departure airport, arrival airport, and units are specified!');
          return '';
        }

        var p1 = new LatLon(self.departureAirport().airportData().lat, self.departureAirport().airportData().lng);
        var p2 = new LatLon(self.arrivalAirport().airportData().lat, self.arrivalAirport().airportData().lng);
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
        //console.log('ViewModel.distBtwnAirports: Distance between ' + self.departureAirport().airportData().name + ' and ' + self.arrivalAirport().airportData().name + ' is approximately: ' + distanceToReturnTrimmed + ' ' + unit);
        var distanceToReturnTrimmed =  parseFloat(distanceToReturn).toFixed(2);
        return distanceToReturnTrimmed;
      },

      deferEvaluation: true
    }, this);
  };
  /***************************************************************************************/

};
