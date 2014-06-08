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
    owner: self//,
    //deferEvaluation: true
  });
/*
  self.encodedAirportSearchTerm = ko.computed({
    read: function() {
      console.log('------------------------BEGINNING AIRPORT SEARCH (' + self.name + ')-------------------------------');
      if(typeof self.airportSearchTermDelayed() !== 'undefined' && self.airportSearchTermDelayed() !== null && self.airportSearchTermDelayed() !== '') {
        console.log('Airport.' + self.name + '.encodedAirportSearchTerm: Encoded Airport Search Term is: ' + self.airportSearchTermDelayed())
        return encodeURI(self.airportSearchTermDelayed());
      } else {
        console.log('Airport.' + self.name + '.encodedAirportSearchTerm: Airport is undefined or null or empty');
        return undefined;
      }
    },
    owner: self,
    deferEvaluation: true
  });
  self.throttledAirportSearchTerm = ko.computed({
    read: function() {
      if(typeof self.airportSearchTermDelayed() !== 'undefined' && self.airportSearchTermDelayed() !== null && self.airportSearchTermDelayed() !== '') {
        console.log('Airport.' + self.name + '.throttledAirportSearchTerm: Throttled Airport Search Term: ' + self.airportSearchTermDelayed());
        return self.encodedAirportSearchTerm();//.extend({ rateLimit: { method: 'notifyWhenChangesStop', timeout: 1000 } })();
      } else {
        console.log('Airport.' + self.name + '.throttledAirportSearchTerm: Throttled Airport is undefined or null or empty');
        return undefined;
      }
    },
    owner: self,
    deferEvaluation: true
  });
*/
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
    owner: self//,
    //deferEvaluation: true
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
    //var self = this;
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
            /*function(data) {
        console.log('Airport.' + self.name + '.fetchSearchResults: Found results!');
        console.log('Airport.' + self.name + '.fetchSearchResults: Raw result object is below --v ');
        console.log(data);
        
        //self.singleSearchResults(data);
        self.extenderSearchResults(data);
        //if(data) {
        //  self.airportData(self.extenderSearchResults()[0]);
        //}
        console.log('Airport.' + self.name + '.fetchSearchResults: Value of extenderSearchResults is below (should match raw result object defined immediately above  ---v ');
        console.log(self.extenderSearchResults());
     
        //console.log('Airport.' + self.name + '.fetchSearchResults: Value of singleSearchResults is below (should match raw result object defined immediately above  ---v ');
        //console.log(self.singleSearchResults());
      },*/
      error: self.fetchSearchResultsFailure
    });
  };

  // RIGHT NOW THE EXTENDER SEARCH RESULTS DOES NOT GET UPDATED WHEN AIRPORTS ARE REMOVED, WAS DOING SO BEFORE WHEN THE OTHER MARKER 
  // AND COORDINATE SUBSCRIBE METHODS WERE UPDATING THE MARKERS/COORDS IN A BUNCH OF DIFFERENT PLACES. LOOK FOR WHICH THINGS THAT 
  // ARE NOW COMMENTED OUT WOULD CAUSE THIS NOT TO TRIGGER AN UPDATE WHEN AIRPORTS ARE REMOVED. SOMETHING TO DO WITH THE 'NO AJAX REQUEST MADE'
  // MESSAGE WHEN AN AIRPORT IS REMOVED. PROBABLY NEED TO TRIGGER AN UPDATE THERE SO THAT MARKERS AND DATA ARE REMOVED AND MAP PANS APPROPRIATELY.
  // THIS IS ALREADY SET UP IN THE SUBSCRIBE METHOD ABOVE FOR THE MAP MARKERS, THE MARKERS JUST AREN'T GETTING CHANGED WHEN DATA CHANGES
  //self.extenderSearchResults = ko.observableArray([]).extend({lazy: {callback: self.fetchFunctionSearchResults, context: self}});
   
  self.extenderSearchResults = ko.lazyObservable(self.fetchFunctionSearchResults, self);
  self.airportSearchTermThrottledEncoded.subscribe(function(newVal) {
    self.extenderSearchResults.refresh();
  });
  
  self.airportData = ko.computed({
    read: function() {
      if(typeof self.extenderSearchResults() !== 'undefined' 
      && self.extenderSearchResults() !== null 
      && self.extenderSearchResults().length > 0
      && typeof self.extenderSearchResults()[0].geometry !== 'undefined') {
        console.log('Airport.' + self.name + '.airportData: Found airport data! \'results\' copied below -----v');
        console.log(self.extenderSearchResults()[0]);
        return self.extenderSearchResults()[0];
      } else {
        console.log('Airport.' + self.name + '.airportData: No airport data found');
        return self.emptyData;
      }
    },
    owner: self
  });


/*
  var AJAXCallback = {
    success: function(results, status) {
      console.log('Airport.AJAXCallback: AJAX Success! Raw Response:');
      console.log(results);

      self.airportSearchResults(results.results);

      console.log('Printing results section of response');
      console.log(results.results);
      console.log('Airport.AJAXCallback: Extracted Airport Results');
      console.log(self.airportSearchResults());
    },
    failure: function(pbj, error, exception) {
      console.log('Airport.AJAXCallback: AJAX Failure!');
    }
  };
  
  self.throttledAirportSearchTerm.subscribe(function(newSearchTerm){
    $.ajax({
      type: 'GET',
      dataType: 'json',
      url: '/airportsearch',
      data: {'search_query': newSearchTerm},
      success: AJAXCallback.success,
      failure: AJAXCallback.failure
    });
  });
*/

  /*
  self.airportSearchManager = ko.observable(new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: self.airportSearchUrl()
  }));
*/

  self.extenderSearchResults.subscribe(function(newSearchResults){
    console.log('Airport.' + self.name + '.extenderSearchResults.subscribe: Hit the extenderSearchResults subscription, airportSearchterm is: ' + self.airportSearchTermThrottledEncoded());
    console.log(newSearchResults);
    //console.log('Airport.singleSearchResults: airportData: Triggered airportSearchResults subscription! About to set airportData for matching airport');

    //if(typeof newSearchResults === 'undefined' || typeof newSearchResults[0] === 'undefined') {
     // console.log('Airport.airportData: No airport search input exists, or no JSON data for airports. Returning default data.');
    //  return self.emptyData;
    //}

    //var resultAirport = '';
    //if(newSearchResults.length > 0 && newSearchResults[0].name === self.airportSearchTerm()) {
      //self.airportData(newSearchResults[0]);

      //console.log('Airport.singleSearchResults: airportData: Found matching airport: ' + resultAirport.name);
    //} else if(self.airportData() !== self.emptyData) {
      //self.airportData(self.emptyData);
      //console.log('Airport.singleSearchResults: airportData: No matching airport found.');
    //}
  });
  /*
  self.buildAirportNameQuery = function(term) {
    return 'select * from json where url = \'http://airportcode.riobard.com/search?fmt=JSON&q=' + encodeURI(term) + '\'';
  };
  self.buildAirportDataQuery = function(term) {
    return 'select * from json where url = \'http://airports.pidgets.com/v1/airports/search?fmt=JSON&q=' + encodeURI(term) + '\'';
  };

  self.makeRequest = function(request, response) {
    $.ajax({
      url: 'http://query.yahooapis.com/v1/public/yql',
      data: {
        q: self.buildQuery(request.term),
        format: 'json'
      },
      dataType: 'jsonp',
      success: function(data) {
        var airports = [];
        if (data && data.query && data.query.results && data.query.results.json && data.query.results.json.json) {
          airports = data.query.results.json.json;
        }

        response($.map(airports, function(item) {
          return {
            label: item.code + (item.name ? ', ' + item.location : '') + ', ' + item.location,
            value: item.code
          };
        }));
      },
      error: function () {
        response([]);
      }
    });
  };
  */

  /*
  self.airportData = ko.computed({
    read: function() {
      console.log('Airport.airportData: Computing results for airport ' + self.name + ', search term is: "' + self.airportSearchInput() + '"');

      if(typeof self.airportSearchResults() === 'undefined' || typeof self.airportSearchInput() === 'undefined' || self.airportSearchInput().length === 0) {
        console.log('Airport.airportData: No airport search input supplied, or no JSON data for airports. Returning default data.');
        return self.emptyData;
      }

      //var filteredAirports = _.filter(self.airportSearchResults(), function(airport) {
      //var filteredAirports = _.filter(self.airportSearchResults(), function(airport) {
      //  return self.airportSearchInput() === airport.name;
      //});
      var filteredAirports = self.airportSearchResults();

      var resultAirport = '';
      if(filteredAirports.length > 0 && filteredAirports[0].name === self.airportSearchInput()) {
        resultAirport = filteredAirports[0];

        console.log('Airport.airportData: Found matching airport: ' + resultAirport.name);
      } else {
        resultAirport = self.emptyData;
        console.log('Airport.airportData: No matching airport found.');
      }

      return resultAirport;
    },
    owner: self,
    deferEvaluation: true
  });
  */
 
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
        var _LatLng = new google.maps.LatLng(parseFloat(self.airportData().geometry.location.lat, 10), parseFloat(self.airportData().geometry.location.lng, 10));
        console.log('Airport.' + self.name + '.airportCoords: New airportCoords for ' + self.name + ': (' + _LatLng.lat().toFixed(2) + ', ' + _LatLng.lng().toFixed(2) + ')');
        return _LatLng;
      }
    },
    owner: self//,
    //deferEvaluation: true
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
    owner: self//,
    //deferEvaluation: true
  });

};
/*
MapIt.Airport.prototype.fetchSearchResultsFailure = function() {
  console.log('Airport.fetchSearchResultsFailure: FETCHING OF DATA FAILEDDDDDDDD');
  self.extenderSearchResults(self.emptyData);
};
MapIt.Airport.prototype.fetchSearchResultsSuccess = function(data) {
      console.log('Airport.' + self.name + '.fetchSearchResultsSuccess: Fetching of Data Success!');
      console.log('Airport.' + self.name + '.fetchSearchResults: Found results!');
      console.log('Airport.' + self.name + '.fetchSearchResults: Raw result object is below --v ');
      console.log(data);
      
      self.extenderSearchResults(self.data);
      
      console.log('Airport.' + self.name + '.fetchSearchResults: Value of extenderSearchResults is below (should match raw result object defined immediately above  ---v ');
      console.log(self.extenderSearchResults());
};

*/
MapIt.Airport.prototype.fetchSearchResults = function() {
  var self = this;
  console.log('Airport.' + self.name + '.fetchSearchResults: base URI: (' + self.localSearchBaseURI + ')');
  if(typeof self.throttledAirportSearchTerm() === 'undefined' || self.throttledAirportSearchTerm() === null || self.throttledAirportSearchTerm() === '') {
    console.log('Airport.' + self.name + '.fetchSearchResults: NO SEARCH TERM SPECIFIED! AJAX CALL WILL NOT EXECUTE');
    return;
  }

  console.log('Airport.' + self.name + '.fetchSearchResults: search_query: (' + self.throttledAirportSearchTerm() + ')');
  console.log('------------------------------MAKING AJAX REQUEST--------------------------------');
  $.ajax({
    type: 'GET',
    url: self.localSearchBaseURI,
    data: { 'search_query': self.throttledAirportSearchTerm()},
    context: self,
    dataType: 'json',
    success: self.fetchSearchResultsSuccess,
          /*function(data) {
      console.log('Airport.' + self.name + '.fetchSearchResults: Found results!');
      console.log('Airport.' + self.name + '.fetchSearchResults: Raw result object is below --v ');
      console.log(data);
      
      //self.singleSearchResults(data);
      self.extenderSearchResults(data);
      //if(data) {
      //  self.airportData(self.extenderSearchResults()[0]);
      //}
      console.log('Airport.' + self.name + '.fetchSearchResults: Value of extenderSearchResults is below (should match raw result object defined immediately above  ---v ');
      console.log(self.extenderSearchResults());
   
      //console.log('Airport.' + self.name + '.fetchSearchResults: Value of singleSearchResults is below (should match raw result object defined immediately above  ---v ');
      //console.log(self.singleSearchResults());
    },*/   
    error: self.fetchSearchResultsFailure
  });
};
