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


  self.extenderSearchResults = ko.observable();
   //self.selectedResult = ko.observable(self.emptyData);
  self.selectedResult = ko.computed(function(){
    if(typeof self.extenderSearchResults() !== 'undefined' && self.extenderSearchResults() !== null && self.extenderSearchResults().length > 0) {
      return self.extenderSearchResults()[0];
    } else {
      return self.emptyData;
    }
  });

  self.airportData = ko.computed({
    read: function() {
      return self.selectedResult();
    }
  });

 /*
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
      if(typeof self.selectedResult() === 'undefined' ||  typeof self.selectedResult().name === 'undefined' || self.selectedResult().name === '') {
        console.log('Airport.airportCoords: No airport supplied to airportCoords for ' + self.name + '!');
        return null;
      } else {
        var _LatLng = new google.maps.LatLng(parseFloat(self.selectedResult().lat, 10), parseFloat(self.selectedResult().lng, 10));
        console.log('Airport.' + self.name + '.airportCoords: New airportCoords for ' + self.name + ': (' + _LatLng.lat().toFixed(2) + ', ' + _LatLng.lng().toFixed(2) + ')');
        return _LatLng;
      }
    },
    owner: self
  });

  self.airportMarker = ko.computed({
    read: function() {
      console.log('Airport.' + self.name + '.airportMarker: Recomputing airportMarker for ' + self.name);
      if(typeof self.selectedResult() === 'undefined' ||  typeof self.selectedResult().name === 'undefined' || self.selectedResult().name === '') {
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

  /*********************** Bloodhound and Typeahead Functions *************************/

  function onOpened($e) {
    console.log('opened');
  }

  function onClosed($e) {

  }

  function onAutocompleted($e, s, datum) {
      //Only fires whenever you search for an item and hit tab or enter to autocomplete to the first suggested result
    console.log('AUTOCOMPLETED DATA - AUTOCOMPLETED RESULT SHOULD UPDATE AUTOMATICALLY');
    console.log(datum);
    //self.selectedResult(datum);
    //typeAheadEl.typeahead('val', datum.name);
  }

  function onSelected($e, s, datum) {
      //Fires when you select one of the options in the autocomplete either with the mouse or using the arrow keys and tab/enter
    console.log('SELECTED DATA - SELECTED RESULT SHOULD UPDATE AUTOMATICALLY');
    console.log(datum);
    //self.selectedResult(datum);
    //typeAheadEl.typeahead('val', datum.name);
  }

  self.registerEnterKeyAutocomplete = function (typeAheadEl) {
    typeAheadEl.on('keydown', function(event) {
      // Define tab key
      var e = jQuery.Event('keydown');
      e.keyCode = e.which = 9; // 9 == tab
      
      if (event.which === 13) {// if pressing enter
        typeAheadEl.trigger(e); // trigger "tab" key - which works as "enter"
      }

      // Closes the typeahead when tab or enter selects an item
      typeAheadEl.typeahead('close');
    });
  }

  self.remoteFilter = function(airports) {
    console.log('****************************EXECUTED AIRPORT SEARCH (' + self.name + ') ************************************');
    
    console.log('Bloodhound.remote.filter: Found some airports! ---v');
    console.log(airports);

    // Map the properties of the returned geoplanet data to the viewmodel properties
    var mappedOutputPreFiltering = $.map(airports.geonames, function (airport) {
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

    // Filter out airports without IATA codes - they're probably not legit
    var mappedOutput = _.filter(mappedOutputPreFiltering, function(item) {
      return (typeof item.code !== 'undefined' && item.code !== null && item.code !== '');
    });

    // Update the stored data variables with retrieved values, or empty data if nothing was retrieved
    if(typeof mappedOutput === 'undefined' || mappedOutput === null || mappedOutput.length < 1) {
      console.log('Bloodhound.remote.filter: No airports found. Resetting data to emptyData');
      self.extenderSearchResults(null);
      //self.selectedResult(self.emptyData);
    } else {
      console.log('Bloodhound.remote.filter: Airports found! Setting data to retrieved results');
      self.extenderSearchResults(mappedOutput);
      //self.selectedResult(self.extenderSearchResults()[0]);
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
      filter: self.remoteFilter
    }
  };

  // Initialize the Bloodhound search engine
  console.log('ViewModel: Initializing Bloodhound engine');
  self.searchEngine = new Bloodhound(bloodhoundOptions);
  var searchPromise = self.searchEngine.initialize();
  searchPromise.done(function() { console.log('success!'); })
               .fail(function() { console.log('err!'); });

};

