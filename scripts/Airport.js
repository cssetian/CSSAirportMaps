MapIt.Airport = function(map, options) {
  console.log('MapIt.Airport: Initializing Airport ViewModel');
  var self = this;

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
    '"carriers":""' +
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

  self.airportSearchInput = ko.observable();
  self.airportSearchBaseUrl = 'http://airports.pidgets.com/v1/airports/?name=';
  self.airportSearchSuffix = '&format=json';
  self.airportSearchUrl = ko.computed(function () {
    var output = self.airportSearchBaseUrl + self.airportSearchInput() + self.airportSearchSuffix;
    console.log('Airport Search Url: ' + output);
    return output;
  });
  self.airportSearchResults = ko.observableArray([]);

  var AJAXCallback = {
    success: function(data) {
      console.log('Airport.AJAXCallback: Found AJAX Results!');
      console.log(data);
      self.airportSearchResults(JSON.parse(data));
    },
    failure: function(pbj, error, exception) {
      console.log('Airport.AJAXCallback: Error fetching airports!');
    }
  };

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
  self.airportData = ko.computed({
    read: function() {
      console.log('Airport.airportData: Reading input for airport ' + self.name + ', value is: "' + self.airportSearchInput() + '"');

      if(typeof self.airportSearchResults() === 'undefined' || typeof self.airportSearchInput() === 'undefined' || self.airportSearchInput().length === 0) {
        console.log('Airport.airportData: No airport search input supplied, or no JSON data for airports. Returning default data.');
        return self.emptyData;
      }

      //var filteredAirports = _.filter(self.airportSearchResults(), function(airport) {
      var filteredAirports = _.filter(airportsJSON, function(airport) {
        return self.airportSearchInput() === airport.name;
      });

      var resultAirport = '';
      if(filteredAirports.length > 0) {
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
  
  self.airportCoords = ko.computed({
    read: function() {
      console.log('Airport.airportCoords: Recomputing airportCoords for ' + self.name);
      if(typeof self.airportData() === 'undefined' ||  typeof self.airportData().code === 'undefined' || self.airportData().code === '') {
        console.log('Airport.airportCoords: No airport supplied to airportCoords for ' + self.name + '!');
        return null;
      } else {
        var _LatLng = new google.maps.LatLng(parseFloat(self.airportData().lat, 10), parseFloat(self.airportData().lon, 10));
        console.log('Airport.airportCoords: New airportCoords for ' + self.name + ': (' + _LatLng.lat().toFixed(2) + ', ' + _LatLng.lng().toFixed(2) + ')');
        return _LatLng;
      }
    },
    owner: self
  });

  self.airportMarker = ko.computed({
    read: function() {
      console.log('Airport.airportMarker: Recomputing airportMarker for ' + self.name);
      if(typeof self.airportData() === 'undefined' ||  typeof self.airportData().code === 'undefined' || self.airportData().code === '') {
        console.log('Airport.airportMarker: No airport supplied to airportMarker for ' + self.name + '!');
        return null;
      } else {
        var _Marker = new google.maps.Marker({ position: self.airportCoords(), title: self.name});
        console.log('Airport.airportMarker: New airport Marker for ' + self.name + ': ' + _Marker.getPosition().lat().toFixed(2) + ', ' + _Marker.getPosition().lng().toFixed(2));
        return _Marker;
      }
    },
    owner: self
  });

};