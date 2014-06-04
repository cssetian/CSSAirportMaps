MapIt.Airport = function(map, options) {
  console.log('MapIt.Airport: Initializing Airport ViewModel');
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

  self.isAirportSelected = ko.computed({
    read: function() {
      return !(typeof self.airportData() === 'undefined' || typeof self.airportData().code === 'undefined' || self.airportData().code === '');
    },
    owner: self,
    deferEvaluation: true
  });

  self.airportTextSearchBaseUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json?&name=airport&types=airport&sensor=false&key=AIzaSyC_i9CE-MZrDZDLY9MdrfukhcEBkatg3Jc&query=';
  self.airportSearchInput = ko.observable();
  self.airportSearchInputThrottled = ko.computed(self.airportSearchInput)
                                        .extend({ rateLimit: { method: 'notifyWhenChangesStop', timeout: 1000 } });
  self.airportSearchUrl = ko.computed(function () {
    var output = self.airportTextSearchBaseUrl + encodeURI(self.airportSearchInputThrottled()); //self.airportSearchInput(); + self.airportSearchSuffix;
    console.log('Airport Search Url: ' + output);
    return output;
  }).extend({ rateLimit: 0 });
  /*
  self.airportSearchBaseUrl = 'https://maps.googleapis.com/maps/api/place/search/json?sensor=false&rankby=prominence&keyword=airport&types=airport';
  self.googlePlacesAPIKey = '&key=' + 'AIzaSyDC0_jxucNVmD3mA40DOUB8463jhdQ0yPE';
  self.airportSearchInput = ko.observable();
  self.computedAirportSearchInput = ko.computed(function() {
    return '&name=' + encodeURI(self.airportSearchInput());
  });
  //self.airportSearchBaseUrl = 'http://airports.pidgets.com/v1/airports/?name=';
  //self.airportSearchSuffix = '&format=json';
  self.airportSearchUrl = ko.computed(function () {
    var output = self.airportSearchBaseUrl + self.googlePlacesAPIKey + self.computedAirportSearchInput(); //self.airportSearchInput(); + self.airportSearchSuffix;
    console.log('Airport Search Url: ' + output);
    return output;
  });
*/
  self.airportSearchResults = ko.mapping.fromJS([]);
  self.airportData = ko.observable(self.emptyData);

  /*
  self.airportSearchResultsNameList = ko.computed({
    read: function() {
      var plucked_results = _.pluck(self.airportSearchResults(), "name");
      console.log('plucked results! Original: ');
      console.log(self.airportSearchResults());
      console.log('plucked results! Plucked: ');
      console.log(plucked_results);
      return plucked_results;
    },
    owner: self
  });
  */
  var AJAXCallback = {
    success: function(results, status) {
      console.log('Airport.AJAXCallback: Found AJAX Results!');
      
      console.log(results);
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        console.log(results);
      }
      
      self.airportSearchResults(results.results);
      console.log('Airport.AJAXCallback: Extracted Airport Results');
      console.log(self.airportSearchResults());
    },
    failure: function(pbj, error, exception) {
      console.log('Airport.AJAXCallback: Error fetching airports!');
    }
  };
  
  self.airportSearchInputThrottled.subscribe(function(newSearchInput){
    var sanitizedInput = encodeURI(newSearchInput);
    /*
    $.ajax({
      type: 'GET',
      dataType: 'json',
      //url: '/airportsearch?airportSearchQuery=' + newSearchInput,
      url: 'airportsearch',
      data: {'search_query': sanitizedInput},
      success: AJAXCallback.success,
      failure: AJAXCallback.failure
    });*/
    AJAXCallback.success(sampleAirports);


    //$.getJSON('newSearchUrl', function(json_data){
    //  alert(JSON.stringify(json_data));
    //});

    /* google maps service try, not using own app server
    var pyrmont = new google.maps.LatLng(-33.8665433,151.1956316);

    var request = {
      query: self.airportSearchInput(),
      type: 'airport'
    };

    var service = new google.maps.places.PlacesService(document.getElementById('map-canvas'));
    service.textSearch(request, AJAXCallback);
    */
   
    /*
    var sanitizedSearchUrl = escape(newSearchUrl);
    $.ajax({
      url: sanitizedSearchUrl,
      type: 'POST',
      success: AJAXCallback.success,
      error: AJAXCallback.failure,
      timeout: 3000
    });
    */
  });//.extend({ rateLimit: 0 });

  /*
  self.airportSearchInput.subscribe(function(searchInput){
    var sanSearchInput = escape(searchInput);
    $.ajax({
      url: 'AirportSearch',
      type: 'GET',
      data: {searchInput: sanSearchInput},
      success: AJAXCallback.success,
      error: AJAXCallback.failure,
      timeout: 3000
    });
  });

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
  self.airportSearchResults.subscribe(function(newSearchResults){
    if(typeof newSearchResults === 'undefined' || typeof newSearchResults[0] === 'undefined') {
      console.log('Airport.airportData: No airport search input exists, or no JSON data for airports. Returning default data.');
      return self.emptyData;
    }

    var resultAirport = '';
    if(newSearchResults.length > 0 && newSearchResults[0].name === self.airportSearchInput()) {
      self.airportData(newSearchResults[0]);

      console.log('Airport.airportData: Found matching airport: ' + resultAirport.name);
    } else if(self.airportData() !== self.emptyData) {
      self.airportData(self.emptyData);
      console.log('Airport.airportData: No matching airport found.');
    }
  });

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
 
  self.airportCoords = ko.computed({
    read: function() {
      console.log('Airport.airportCoords: Recomputing airportCoords for ' + self.name);
      if(typeof self.airportData() === 'undefined' ||  typeof self.airportData().name === 'undefined' || self.airportData().name === '') {
        console.log('Airport.airportCoords: No airport supplied to airportCoords for ' + self.name + '!');
        return null;
      } else {
        var _LatLng = new google.maps.LatLng(parseFloat(self.airportData().geometry.location.lat, 10), parseFloat(self.airportData().geometry.location.lng, 10));
        console.log('Airport.airportCoords: New airportCoords for ' + self.name + ': (' + _LatLng.lat().toFixed(2) + ', ' + _LatLng.lng().toFixed(2) + ')');
        return _LatLng;
      }
    },
    owner: self
  });

  self.airportMarker = ko.computed({
    read: function() {
      console.log('Airport.airportMarker: Recomputing airportMarker for ' + self.name);
      if(typeof self.airportData() === 'undefined' ||  typeof self.airportData().name === 'undefined' || self.airportData().name === '') {
        console.log('Airport.airportMarker: No airport supplied to airportMarker for ' + self.name + '!');
        return null;
      } else {
        var _Marker = new google.maps.Marker({ position: self.airportCoords(), title: self.name});
        console.log('Airport.airportMarker: New airport Marker for ' + self.name + ': ' + _Marker.getPosition() .lat().toFixed(2) + ', ' + _Marker.getPosition().lng().toFixed(2));
        return _Marker;
      }
    },
    owner: self
  });

};