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

  self.airportSearchTerm = ko.observable();
  self.airportSearchResults = ko.mapping.fromJS([]);
  self.airportData = ko.computed({
    read: function() {
      return self.emptyData;
    },
    owner: self
  });

  self.remoteSearchBaseURI = 'https://maps.googleapis.com/maps/api/place/textsearch/json?&name=airport&types=airport&sensor=false&key=AIzaSyC_i9CE-MZrDZDLY9MdrfukhcEBkatg3Jc&query=';
  self.localSearchBaseURI = '/airportsearch/';

  self.encodedAirportSearchTerm = ko.computed({
    read: function() {
      if(typeof self.airportSearchTerm() !== 'undefined' && self.airportSearchTerm() !== null && self.airportSearchTerm() !== '') {
        return encodeURI(self.airportSearchTerm());
      } else {
        return undefined;
      }
    },
    owner: self,
    deferEvaluation: true
  });
  self.throttledAirportSearchTerm = ko.computed({
    read: function() {
      if(typeof self.encodedAirportSearchTerm() !== 'undefined' && self.encodedAirportSearchTerm() !== null && self.encodedAirportSearchTerm() !== '') {
        return self.encodedAirportSearchTerm().extend({ rateLimit: { method: 'notifyWhenChangesStop', timeout: 1000 } });
      } else {
        return undefined;
      }
    },
    owner: self,
    deferEvaluation: true
  });

  self.airportSearchUrl = ko.computed({
    read: function () {
      if(typeof self.encodedAirportSearchTerm() !== 'undefined' && self.encodedAirportSearchTerm() !== null && self.encodedAirportSearchTerm() !== '') {
        var output = self.mapItAirportLocalBaseURI + encodeURI(self.airportThrottledSearchTerm()); //self.airportSearchInput(); + self.airportSearchSuffix;
        console.log('Airport Search Url: ' + output);
        return output;
      } else {
        return undefined;
      }
    },
    owner: self,
    deferEvaluation: true
  }).extend({ rateLimit: 0 });

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

  /*
  self.airportSearchManager = ko.observable(new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: self.airportSearchUrl()
  }));
*/

  self.airportSearchResults.subscribe(function(newSearchResults){
    console.log('Triggered airportSearchResults subscription!');

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
      return !(typeof self.airportData() === 'undefined' || typeof self.airportData().code === 'undefined' || self.airportData().code === '');
    },
    owner: self,
    deferEvaluation: true
  });

  self.toAirportCoords = ko.computed({
    read: function() {
      console.log('Airport.toAirportCoords: Recomputing toAirportCoords for ' + self.name);
      if(typeof self.airportData() === 'undefined' ||  typeof self.airportData().name === 'undefined' || self.airportData().name === '') {
        console.log('Airport.toAirportCoords: No airport supplied to toAirportCoords for ' + self.name + '!');
        return null;
      } else {
        var _LatLng = new google.maps.LatLng(parseFloat(self.airportData().geometry.location.lat, 10), parseFloat(self.airportData().geometry.location.lng, 10));
        console.log('Airport.toAirportCoords: New toAirportCoords for ' + self.name + ': (' + _LatLng.lat().toFixed(2) + ', ' + _LatLng.lng().toFixed(2) + ')');
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
        var _Marker = new google.maps.Marker({ position: self.toAirportCoords(), title: self.name});
        console.log('Airport.airportMarker: New airport Marker for ' + self.name + ': ' + _Marker.getPosition() .lat().toFixed(2) + ', ' + _Marker.getPosition().lng().toFixed(2));
        return _Marker;
      }
    },
    owner: self
  });

};