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

  
  self.extenderSearchResults = ko.observable();
  //self.extenderSearchResults = ko.lazyObservable(self.fetchFunctionSearchResults, self);
  /*self.airportSearchTermThrottledEncoded.subscribe(function(newVal) {
    self.extenderSearchResults.refresh();
  });
  */
  self.airportData = ko.computed({
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
/*
  self.extenderSearchResults.subscribe(function(newSearchResults){
    console.log('Airport.' + self.name + '.extenderSearchResults.subscribe: Hit the extenderSearchResults subscription - no reason for this to happen - , airportSearchterm is: ' + self.airportSearchTermThrottledEncoded());
    console.log(newSearchResults);
    console.log('Aiprort.' + self.name + '.extenderSearchResults.subscribe: Again - no reason for this to be here...');
  });*/
 
  self.isAirportSelected = ko.computed({
    read: function() {
      return !(typeof self.airportData() === 'undefined' || typeof self.airportData().geometry === 'undefined' || self.airportData().code === '');
    },
    owner: self,
    deferEvaluation: true
  });

  self.airportCoords = ko.computed({
    read: function() {
      console.log('Airport.' + self.name + '.airportCoords: Recomputing airportCoords for ' + self.name);
      if(typeof self.airportData() === 'undefined' ||  typeof self.airportData().name === 'undefined' || self.airportData().name === '') {
        console.log('Airport.airportCoords: No airport supplied to airportCoords for ' + self.name + '!');
        return null;
      } else {
        var _LatLng = new google.maps.LatLng(parseFloat(self.airportData().lat, 10), parseFloat(self.airportData().lng, 10));
        console.log('Airport.' + self.name + '.airportCoords: New airportCoords for ' + self.name + ': (' + _LatLng.lat().toFixed(2) + ', ' + _LatLng.lng().toFixed(2) + ')');
        return _LatLng;
      }
    },
    owner: self
  });

  self.airportMarker = ko.computed({
    read: function() {
      console.log('Airport.' + self.name + '.airportMarker: Recomputing airportMarker for ' + self.name);
      if(typeof self.airportData() === 'undefined' ||  typeof self.airportData().name === 'undefined' || self.airportData().name === '') {
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

