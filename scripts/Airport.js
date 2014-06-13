MapIt.Airport = function(map, options) {
  console.log('MapIt.Airport: Initializing Airport ViewModel for ' + options.name);
  var self = this;
  var service;
  //_viewModel = viewModel;
  // This is JSON so the quotes should stay as double quotes
  /*var emptyJSON3 = {
    'value': '',
    'name': '',
    'lat': '',
    'lng': '',
    'city': '',
    'country': '',
    'countryCode': '',
    'adminId1': '',
    'geoNameId': '',
    'timeZone': '',
    'code': ''
  };*/
  var emptyJSON = {
    value: '',
    name: '',
    lat: '',
    lng: '',
    city: '',
    country: '',
    countryCode: '',
    adminId1: '',
    geoNameId: '',
    timeZone: '',
    code: ''
  };
  // This is JSON so the quotes should stay as double quotes
 /*
  var emptyJSON2 = {
    "value": "",
    "name": "",
    "lat": "",
    "lng": "",
    "city": "",
    "country": "",
    "countryCode": "",
    "adminId1": "",
    "geoNameId": "",
    "timeZone": "",
    "code": ""
  };
*/

  self.emptyData = emptyJSON;//JSON.parse(emptyJSON);
  self.name = options.name;

  self.airportSearchTerm = ko.observable();
  //self.typeAheadSearchTerm = ko.observable();
  //self.airportSearchTermThrottled = ko.computed(self.airportSearchTerm).extend({ rateLimit: { method: 'notifyWhenChangesStop', timeout: 1000 }});
  

  /* Right now just unnecessary and clouding up some of the debugging
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
  });*/


  self.bloodhoundSearchResultSet = ko.observable();
  self.selectedSearchResultObj = ko.observable(self.emptyData);
   //self.selectedResult = ko.observable(self.emptyData);
   //
   //
  /* THIS WAS A PART OF FIRST WORKING COPY, COMMENTING OUT SO I CAN HAVE MANUAL SELECTION OF AIRPORT ON AUTOCOMPLETE SELECTED
  self.selectedResult = ko.computed(function(){
    if(typeof self.bloodhoundSearchResultSet() !== 'undefined' && self.bloodhoundSearchResultSet() !== null && self.bloodhoundSearchResultSet().length > 0) {
      return self.bloodhoundSearchResultSet()[0];
    } else {
      return self.emptyData;
    }
  });

  self.selectedSearchResultObj = ko.computed({
    read: function() {
      return self.selectedResult();
    }
  });
*/

 /*
  self.selectedSearchResultObj = ko.computed({
    read: function() {
      if(typeof self.bloodhoundSearchResultSet() !== 'undefined' 
      && self.bloodhoundSearchResultSet() !== null 
      && self.bloodhoundSearchResultSet().length > 0
      && typeof self.bloodhoundSearchResultSet()[0].geometry !== 'undefined') {
        console.log('Airport.' + self.name + '.selectedSearchResultObj: Found airport data! \'results\' copied below -----v');
        console.log(self.bloodhoundSearchResultSet()[0]);
        return self.bloodhoundSearchResultSet().geonames[0];
      } else {
        console.log('Airport.' + self.name + '.selectedSearchResultObj: No airport data found');
        return self.emptyData;
      }
    },
    owner: self
  });*/
 
  self.isAirportSelected = ko.computed({
    read: function() {
      return !(typeof self.selectedSearchResultObj() === 'undefined' || typeof self.selectedSearchResultObj().name === 'undefined' || self.selectedSearchResultObj().name === '');
    },
    owner: self,
    deferEvaluation: true
  });

  self.airportCoords = ko.computed({
    read: function() {
      console.log('Airport.' + self.name + '.airportCoords: Recomputing airportCoords for ' + self.name);
      if(typeof self.selectedSearchResultObj() === 'undefined' ||  typeof self.selectedSearchResultObj().name === 'undefined' || self.selectedSearchResultObj().name === '') {
        console.log('Airport.airportCoords: No airport supplied to airportCoords for ' + self.name + '!');
        return null;
      } else {
        var _LatLng = new google.maps.LatLng(parseFloat(self.selectedSearchResultObj().lat, 10), parseFloat(self.selectedSearchResultObj().lng, 10));
        console.log('Airport.' + self.name + '.airportCoords: New airportCoords for ' + self.name + ': (' + _LatLng.lat().toFixed(2) + ', ' + _LatLng.lng().toFixed(2) + ')');
        return _LatLng;
      }
    },
    owner: self
  });

  self.airportMarker = ko.computed({
    read: function() {
      console.log('Airport.' + self.name + '.airportMarker: Recomputing airport marker for ' + self.name);
      if(typeof self.selectedSearchResultObj() === 'undefined' ||  typeof self.selectedSearchResultObj().name === 'undefined' || self.selectedSearchResultObj().name === '') {
        console.log('Airport.' + self.name + '.airportMarker: Current search term is - ' + self.airportSearchTerm() + ', and has no results and no MapMarker');
        return null;
      } else {
        var _Marker = new google.maps.Marker({ position: self.airportCoords(), title: self.name});
        console.log('Airport.' + self.name + '.airportMarker: New airport marker for ' + self.name + ': ' + _Marker.getPosition() .lat().toFixed(2) + ', ' + _Marker.getPosition().lng().toFixed(2));
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
  /*
  function onSelected($e, s, datum) {
      //Fires when you select one of the options in the autocomplete either with the mouse or using the arrow keys and tab/enter
    console.log('SELECTED DATA - SELECTED RESULT SHOULD UPDATE AUTOMATICALLY');
    console.log(datum);
    self.selectedResultObj(datum)
    //self.selectedResult(datum);
    //typeAheadEl.typeahead('val', datum.name);
  }*/


  // Subscribe to the input airport search term so you can turn off all the visual data stuff and render in between selecting airprots
  self.airportSearchTerm.subscribe(function(newVal) {
    console.log('ViewModel.<' + self.name + '>.airportSearchTerm.subscribe: new Search Term: (' + newVal + ')');

    if(typeof newVal === 'undefined' || newVal === null || newVal === '') {
      console.log('ViewModel.<' + self.name + '>.airportSearchTerm.subscribe: Search Term deleted! Re-rendering map');

      self.bloodhoundSearchResultSet(null);
    }
  });

/*
  self.airportSearchTerm.subscribe(function(newVal){
    read: function(newVal) {

    },
    owner: self
  });
*/

  // https://github.com/twitter/typeahead.js/issues/300
  self.onSelectedAndAutocompleted = function(obj, datum, name) {
    //Fires when you select one of the options in the autocomplete either with the mouse or using the arrow keys and tab/enter
    console.log('Airport.<' + self.name + '>.onSelectedAndAutocompleted: SELECTED DATA W MOUSE OR TAB/ENTER- SELECTED RESULT SHOULD UPDATE AUTOMATICALLY --v');
    console.log(datum);

    self.selectedSearchResultObj(datum);  // Assign the selected result object that will be used for rendering when an option of the autocomplete is selected

    //console.log(JSON.stringify(obj)); // object
    // outputs, e.g., {"type":"typeahead:selected","timeStamp":1371822938628,"jQuery19105037956037711017":true,"isTrigger":true,"namespace":"","namespace_re":null,"target":{"jQuery19105037956037711017":46},"delegateTarget":{"jQuery19105037956037711017":46},"currentTarget":
    console.log(JSON.stringify(datum)); // contains datum value, tokens and custom fields
    // outputs, e.g., {"redirect_url":"http://localhost/test/topic/test_topic","image_url":"http://localhost/test/upload/images/t_FWnYhhqd.jpg","description":"A test description","value":"A test value","tokens":["A","test","value"]}
    // in this case I created custom fields called 'redirect_url', 'image_url', 'description'   
    console.log(JSON.stringify(name)); // contains dataset name
    // outputs, e.g., "my_dataset"
    console.log('Airport.<' + self.name + '>.onSelected: END OF onSELECTED EVENT HANDLER AND LOGGING');
  };

  self.registerEnterKeyAutocomplete = function (typeAheadEl) {
    typeAheadEl.on('keydown', function(event) {
      // Define tab key
      var e = $.Event('keydown');
      e.keyCode = e.which = 9; // 9 == tab
      
      if (event.which === 13) {  // if user is pressing enter key
        typeAheadEl.trigger(e); // trigger "tab" key - which works as "enter" for typeahead
      }
      typeAheadEl.typeahead('close');  // Closes the typeahead when tab or enter selects an item
    });
  }

  self.remoteFilter = function(bloodhoundSearchResultObj) {
    console.log('*************************COMPLETED BLOODHOUND AIRPORT SEARCH EXECUTION (' + self.name + ') ****************************');
    console.log('Airport.remoteFilter: (Bloodhound Callback) Found some airports! ---v');
    console.log(bloodhoundSearchResultObj);

    // Map the properties of the returned geoplanet data to the viewmodel properties
    var mappedOutputPreFiltering = $.map(bloodhoundSearchResultObj.geonames, function (airportSearchResultItem) {
      var _IATACode = _.filter(airportSearchResultItem.alternateNames, function(alternateNamesItem) {
        return alternateNamesItem.lang === 'iata';
      });

      //Attempt to match the name of one of the alternateNames in a geoData result item to the official airport code name (IATA)
      var _filteredIATACode = '';
      if(typeof _IATACode !== 'undefined' && _IATACode.length > 0) {
        _filteredIATACode = _IATACode[0].name;
      }

      return {
        value: airportSearchResultItem.toponymName,
        name: airportSearchResultItem.toponymName,
        lat: airportSearchResultItem.lat,
        lng: airportSearchResultItem.lng,
        city: airportSearchResultItem.adminName1,
        country: airportSearchResultItem.countryName,
        countryCode: airportSearchResultItem.countryCode,
        adminId1: airportSearchResultItem.adminId1,
        geoNameId: airportSearchResultItem.geonameId,
        timeZone: airportSearchResultItem.timezone,
        code: _filteredIATACode
      };
    });

    // Filter out airports without IATA codes - they're probably not legit
    var mappedOutput = _.filter(mappedOutputPreFiltering, function(item) {
      return (typeof item.code !== 'undefined' && item.code !== null && item.code !== '');
    });

    // Update the stored data variables with retrieved values, or empty data if nothing was retrieved
    if(typeof mappedOutput === 'undefined' || mappedOutput === null || mappedOutput.length < 1) {
      // It gets here if you delete data but not the entire search box, but how do you make htis trigger the rendering event??
      console.log('Airport.<' + self.name + '>.remoteFilter: (Bloodhound Callback) No airports found. Resetting data to emptyData');
      self.bloodhoundSearchResultSet(null);
      //self.selectedResult(self.emptyData);
    } else {
      console.log('Airport.<' + self.name + '>.remoteFilter: (Bloodhound Callback) Airports found! Setting data to retrieved results');
      self.bloodhoundSearchResultSet(mappedOutput);
      //self.selectedResult(self.bloodhoundSearchResultSet()[0]);
    }

    console.log('Airport.<' + self.name + '>.remoteFilter: (Bloodhound Callback) Mapped Output --v');
    console.log(mappedOutput);
    return mappedOutput;
  };

  // Define the options for bloodhound and typeahead inputs
  console.log('Airport.<' + self.name + '>.body: Defining bloodhound initialization options');
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
  console.log('Airport.<' + self.name + '>.body: Initializing Bloodhound engine');
  self.searchEngine = new Bloodhound(bloodhoundOptions);
  var searchPromise = self.searchEngine.initialize();
  searchPromise.done(function() { console.log('success!'); })
               .fail(function() { console.log('err!'); });

};

