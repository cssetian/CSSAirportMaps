MapIt.Airport = function(map, options) {
  console.log('MapIt.Airport: Initializing Airport ViewModel for ' + options.name);
  var self = this;
  var service;
  // This is JSON so the quotes should stay as double quotes
  var emptyJSON = '{' +
    '"code":"",' +
    '"lat":"",' +
    '"lon":"",' +
    '"name":"",' +
    '"city":"",' +
    '"state":"",' +
    '"country":"",' +
    '"woeid":"",' +
    '"tz":"",' +
    '"phone":"",' +
    '"type":"",' +
    '"email":"",' +
    '"url":"",' +
    '"runway_length":"",' +
    '"elev":"",' +
    '"icao":"",' +
    '"direct_flights":"",' +
    '"carriers":"",' +
    '"geometry":{"location":{"lat":"","lng":""}}' +
  '}';

  self.emptyData = JSON.parse(emptyJSON);
  self.name = options.name;


  self.remoteFilter = function(airports) {
    console.log('****************************EXECUTED AIRPORT SEARCH (' + self.name + ') ************************************');
    console.log('Search Value was: ')
    console.log('Bloodhound.remote.filter: Found some airports! ---v');
    console.log(airports);

    var mappedOutput = $.map(airports.geonames, function (airport) {
      var _IATACode = _.filter(airport.alternateNames, function(item) { return (item.lang === 'iata' && item.name !== ''); });
      var _filteredIATACode = '';
      if(typeof _IATACode !== 'undefined' && _IATACode.length > 0) {
        _filteredIATACode = _IATACode[0].name;
      }
      console.log(_filteredIATACode);
          
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
      self.bloodhoundSearchResults(null);
    } else {
      console.log('Bloodhound.remote.filter: Airports found! Setting data to retrieved results');
      self.bloodhoundSearchResults(mappedOutput);
    }

    console.log('Bloodhound.remote.filter: Mapped Output --v');
    console.log(self.bloodhoundSearchResults());
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
      filter: self.remoteFilter,
    }
  };

  // Initialize the Bloodhound search engine
  console.log('ViewModel: Initializing Bloodhound engine');
  self.airportSearch = new Bloodhound(bloodhoundOptions);
  var searchPromise = self.airportSearch.initialize();
  searchPromise.done(function() { console.log('success!'); })
               .fail(function() { console.log('err!'); });


  self.airportSearchTerm = ko.observable();
  self.typeAheadSearchTerm = ko.observable();
  self.airportSearchTermThrottled = ko.computed(self.airportSearchTerm).extend({ rateLimit: { method: 'notifyWhenChangesStop', timeout: 1000 }});
  
  self.airportSearchResults = ko.mapping.fromJS([]);
  self.remoteSearchBaseURI = 'https://maps.googleapis.com/maps/api/place/textsearch/json?&name=airport&types=airport&sensor=false&key=AIzaSyC_i9CE-MZrDZDLY9MdrfukhcEBkatg3Jc&query=';
  self.localSearchBaseURI = '/airportsearch';

  self.airportSearchTermThrottledEncoded = ko.computed({
    read: function() {
      console.log('------------------------BEGINNING AIRPORT SEARCH (' + self.name + ')-------------------------------');
      if(typeof self.airportSearchTermThrottled() !== 'undefined' && self.airportSearchTermThrottled() !== null && self.airportSearchTermThrottled() !== '') {
        console.log('Airport.' + self.name + '.airportSearchTermThrottledEncoded: Encoded & Throttled Airport Search Term is: ' + self.airportSearchTermThrottled());
        return encodeURI(self.airportSearchTermThrottled());
      } else {
        console.log('Airport.' + self.name + '.airportSearchTermThrottledEncoded: Airport is undefined or null or empty');
        return undefined;
      }
    },
    owner: self
  });
  self.airportRemoteSearchUrl = ko.computed({
    read: function () {
      if(typeof self.airportSearchTermThrottledEncoded() !== 'undefined' && self.airportSearchTermThrottledEncoded() !== null && self.airportSearchTermThrottledEncoded() !== '') {
        var output = self.remoteSearchBaseURI + self.airportSearchTermThrottledEncoded();
        console.log('Airport.' + self.name + '.airportSearchUrl: Airport Search Url: ' + output);
        return output;
      } else {
        console.log('Airport.' + self.name + '.airportRemoteSearchUrl: Airport is undefined or null or empty');
        return undefined;
      }
    },
    owner: self
  });

/*
  self.fetchSearchResultsFailure = function() {
    console.log('Airport.' + self.name + '.fetchSearchResultsFailure: FETCHING OF DATA FAILEDDDDDDDD');
    self.extenderSearchResults(null);
  };
  self.fetchSearchResultsSuccess = function(data) {
    console.log('Airport.' + self.name + '.fetchSearchResultsSuccess: Fetching of Data Success!');
    console.log('Airport.' + self.name + '.fetchSearchResultsSuccess: Found results!');
    console.log('Airport.' + self.name + '.fetchSearchResultsSuccess: Raw result object of ' + self.name + ' is copied below and written to extenderSearchResults, and is a subset from the input parameter as data.results[0] --v ');
    console.log(data);
    
    self.extenderSearchResults(data.results);
    
    console.log('Airport.' + self.name + '.fetchSearchResultsSuccess: Value of extenderSearchResults is below (should match raw result object defined immediately above  ---v ');
    console.log(self.extenderSearchResults());
  };
  
  self.fetchFunctionSearchResults = function() {
    console.log('Airport.' + self.name + '.fetchFunctionSearchResults: base URI: (' + self.localSearchBaseURI + ')');
    if(typeof self.airportSearchTermThrottledEncoded() === 'undefined' || self.airportSearchTermThrottledEncoded() === null || self.airportSearchTermThrottledEncoded() === '') {
      console.log('Airport.' + self.name + '.fetchFunctionSearchResults: NO SEARCH TERM SPECIFIED! AJAX CALL WILL NOT EXECUTE. Resetting extenderSearchResults');
      self.extenderSearchResults(null);
      return;
    }

    console.log('Airport.' + self.name + '.fetchFunctionSearchResults: search_query: (' + self.airportSearchTermThrottledEncoded() + ')');
    console.log('------------------------------MAKING AJAX REQUEST--------------------------------');
    $.ajax({
      type: 'GET',
      url: self.localSearchBaseURI,
      data: { 'search_query': self.airportSearchTermThrottledEncoded()},
      context: self,
      dataType: 'json',
      success: self.fetchSearchResultsSuccess,
      error: self.fetchSearchResultsFailure
    });
  };
*/

  self.bloodhoundSearchResults = ko.observable(self.emptyData);

  self.airportData = ko.observable(self.emptyData);
/*
  self.airportData = ko.computed({
    read: function() {
      console.log('RECALCULATING AIRPORTDATA');

      if(typeof self.bloodhoundSearchResults() !== 'undefined' 
      && self.bloodhoundSearchResults() !== null 
      && self.bloodhoundSearchResults().length === 1
      && typeof self.bloodhoundSearchResults()[0].name !== 'undefined') {
        console.log('Airport.' + self.name + '.airportData: Found airport data! \'results\' copied below -----v');
        console.log(self.bloodhoundSearchResults()[0]);
        return self.bloodhoundSearchResults()[0];
      } else {
        console.log('Airport.' + self.name + '.airportData: No airport data found');
        return self.emptyData;
      }
    },
    owner: self
  });
*/
  /*
  self.airportData = ko.computed({
    read: function() {
      if(typeof self.bloodhoundSearchResults() !== 'undefined' 
      && self.bloodhoundSearchResults() !== null 
      && self.bloodhoundSearchResults().length > 0
      && typeof self.bloodhoundSearchResults()[0].name !== 'undefined') {
        console.log('Airport.' + self.name + '.airportData: Found airport data! \'results\' copied below -----v');
        console.log(self.bloodhoundSearchResults()[0]);
        return self.bloodhoundSearchResults()[0];
      } else {
        console.log('Airport.' + self.name + '.airportData: No airport data found');
        return self.emptyData;
      }
    },
    owner: self
  });
  */
  /*self.extenderSearchResults = ko.observable();*/
  //self.extenderSearchResults = ko.lazyObservable(self.fetchFunctionSearchResults, self);
  /*self.airportSearchTermThrottledEncoded.subscribe(function(newVal) {
    self.extenderSearchResults.refresh();
  });
  */
 /*
  self.oldAirportData = ko.computed({
    read: function() {
      if(typeof self.extenderSearchResults() !== 'undefined' 
      && self.extenderSearchResults() !== null 
      && self.extenderSearchResults().length > 0
      && typeof self.extenderSearchResults()[0].geometry !== 'undefined') {
        console.log('Airport.' + self.name + '.airportData: Found airport data! \'results\' copied below -----v');
        console.log(self.extenderSearchResults()[0]);
        return self.extenderSearchResults().geonames[0];
      } else {
        console.log('Airport.' + self.name + '.airportData: No airport data found');
        return self.emptyData;
      }
    },
    owner: self
  });
*/
/*
  self.extenderSearchResults.subscribe(function(newSearchResults){
    console.log('Airport.' + self.name + '.extenderSearchResults.subscribe: Hit the extenderSearchResults subscription - no reason for this to happen - , airportSearchterm is: ' + self.airportSearchTermThrottledEncoded());
    console.log(newSearchResults);
    console.log('Aiprort.' + self.name + '.extenderSearchResults.subscribe: Again - no reason for this to be here...');
  });*/
 
 self.updateTypeAhead = function(data, event) {
  console.log('UDPATING TYPEAHEAD');

  //Allows the rest of the events related to keypress to fire
  return true;
 }
  self.currentSelectionObj = ko.observable(self.emptyData);
  self.currentSelectionObj.subscribe(function(newVal) {
    if(newVal === self.emptyData) {

    }
  });

  self.isAirportSelected = ko.computed({
    read: function() {
      return !(typeof self.airportData() === 'undefined' || typeof self.airportData().name === 'undefined' || self.airportData().code === '');
    },
    owner: self,
    deferEvaluation: true
  });

  self.onOpened = function($e) {
    console.log('opened');
    //$e.currentTarget.select();
    //self.airportData(self.emptyData);
  };

  self.onClosed = function($e) {
    console.log('closed');

  }

  self.onAutocompleted = function($e, datum, name) {
      //Only fires whenever you search for an item and hit tab or enter to autocomplete to the first suggested result
    console.log('autocompleted');
    console.log(datum);
    console.log(name);
    console.log($e);
    console.log('searchList Name: ');
    console.log(name);
    console.log('data: ');
    console.log(datum);
    //self.airportData(datum);
    self.currentSelectionObj(datum);
    
    //$(".ui-menu-item").hide();

  };

  self.onSelected = function($e, datum) {
      //Fires when you select one of the options in the autocomplete either with the mouse or using the arrow keys and tab/enter
    console.log('selected ---v');
    console.log(datum);
    self.airportData(datum);
    self.currentSelectionObj(datum);

  };

  self.onFocus = function(self) {
    $(self).select();
  };

  self.registerEnterKeyAutocomplete = function(typeAheadEl) {
    typeAheadEl.on('keydown', function(event) {
      // Define tab key
      var e = jQuery.Event('keydown');
      e.keyCode = e.which = 9; // 9 == tab
      
      if (event.which === 13) {// if pressing enter
        typeAheadEl.trigger(e); // trigger "tab" key - which works as "enter"
      }
    });

    typeAheadEl.focus(function() { self.onFocus(this); } );
  };

  self.airportCoords = ko.computed({
    read: function() {
      console.log('Airport.' + self.name + '.airportCoords: Recomputing airportCoords for ' + self.name);
      if(typeof self.currentSelectionObj() === 'undefined' ||  typeof self.currentSelectionObj().name === 'undefined' || self.currentSelectionObj().name === '') {
        console.log('Airport.airportCoords: No airport supplied to airportCoords for ' + self.name + '!');
        return null;
      } else {
        var _LatLng = new google.maps.LatLng(parseFloat(self.currentSelectionObj().lat, 10), parseFloat(self.currentSelectionObj().lng, 10));
        console.log('Airport.' + self.name + '.airportCoords: New airportCoords for ' + self.name + ': (' + _LatLng.lat().toFixed(2) + ', ' + _LatLng.lng().toFixed(2) + ')');
        return _LatLng;
      }
    },
    owner: self
  });

  self.airportMarker = ko.computed({
    read: function() {
      console.log('Airport.' + self.name + '.airportMarker: Recomputing airportMarker for ' + self.name);
      if(typeof self.currentSelectionObj() === 'undefined' ||  typeof self.currentSelectionObj().name === 'undefined' || self.currentSelectionObj().name === '') {
        console.log('Airport.airportMarker: No airport supplied to airportMarker for ' + self.name + '!');
        return null;
      } else {
        var _Marker = new google.maps.Marker({ position: self.airportCoords(), title: self.name});
        console.log('Airport.' + self.name + '.airportMarker: New airport Marker for ' + self.name + ': ' + _Marker.getPosition() .lat().toFixed(2) + ', ' + _Marker.getPosition().lng().toFixed(2));
        return _Marker;
      }
    },
    owner: self
  });

};

