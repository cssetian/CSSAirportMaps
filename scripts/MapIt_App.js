/*

  Statements that begin with the token function are 
    always considered to be function declarations. 
  Including () creates a function expression instead

 */
var MapIt = MapIt || {};

MapIt.App = (function($, _, ko) {

  var viewModel;
  var airportList = [];

  var _init = function (options) {
    _initAirportRefData(options);

    /*
    airportList = _.map(options.airportsJSON, function(airport) {
      return {
        name: airport.name,
        value: airport.name,
        code: airport.code,
        lat: airport.lat,
        lng: airport.lon,
        city: airport.city,
        state: airport.state,
        country: airport.country,
        icao: airport.icao
      };
    });
    console.log('airportList: ');
    console.log(airportList);
    */
    viewModel = new MapIt.ViewModel();

    _initTypeAhead();


    // If geolocation is available in this browser, set the initial marker to that person's location
    // Otherwise, set location to Manhattan
    if ('geolocation' in navigator) {
      console.log('MapModel.init: Found Geolocation!');
      navigator.geolocation.getCurrentPosition(_geoLocationCallback);
    } else {
      console.log('MapModel.init: Geolocation not available!');
    }

    console.log('Creating default initial position for map - default location is New York, NY');
    var _initialLatLong = new google.maps.LatLng(40.7056308,-73.9780035);
    viewModel.initialCoords(_initialLatLong);
    viewModel.mapMarkers()[0].marker.setPosition(viewModel.initialCoords());

    console.log('Initializing map!');
    viewModel.map().setZoom(10);
    viewModel.map().setCenter(viewModel.initialCoords());
    console.log('Initialized map with default position in Manhattan: ' + viewModel.mapMarkers()[0].marker.position);//+ viewModel.initialCoords());

    ko.applyBindings(viewModel);
    options.domEls.appContainer.fadeIn(50);
  };
  /*
  var _substringMatcher = function(strs) {
    return function findMatches(q, cb) {
      var matches, substrRegex;
   
      // an array that will be populated with substring matches
      matches = [];
   
      // regex used to determine if a string contains the substring `q`
      substrRegex = new RegExp(q, 'i');
   
      // iterate through the pool of strings and for any string that
      // contains the substring `q`, add it to the `matches` array
      $.each(strs, function(i, str) {
        if (substrRegex.test(str)) {
          // the typeahead jQuery plugin expects suggestions to a
          // JavaScript object, refer to typeahead docs for more info
          matches.push({ value: str });
        }
      });
   
      cb(matches);
    };
  };
  */
 /*
  var searchAirportList = function(query, process) {
    var results = airportList;
    process(results);
  };
  */
 
  // This string fetches airports by their IATA code
  var geoNamesCodeBasedURLBase = 'http://api.geonames.org/searchJSON?style=full&lang=en&maxRows=20&featureClass=S&featureCode=AIRP&username=cssetian&fuzzy=0.8&q=sfo&orderby=relevance';
  

  var geoNamesURLBase = 'http://api.geonames.org/searchJSON?lang=en&code=AIRP&maxRows=20&username=cssetian&q=%QUERY';

  var _initTypeAhead = function() {
    console.log('initializing typeahead!');

    var airportSearch = new Bloodhound({
      datumTokenizer: function (d) {
        return Bloodhound.tokenizers.whitespace(d.name);
        //return arr.concat(Bloodhound.tokenizers.whitespace(d.name), Bloodhound.tokenizers.whitespace(d.city), Bloodhound.tokenizers.whitespace(d.country), Bloodhound.tokenizers.whitespace(d.code));
      },
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      limit: 20,
      //local: airportList
      remote: {
        url: 'http://api.geonames.org/searchJSON?style=full&lang=en&maxRows=20&featureClass=S&featureCode=AIRP&username=cssetian&orderby=relevance&name=%QUERY',
        //'http://ws.geonames.org/searchJSON?style=full&lang=en&type=json&maxRows=12&featureClass=S&featureCode=AIRP&username=cssetian&name=%QUERY&orderby=relevance',
        /*replace: function (url, query) {
          // Pulled from Issue #542 to ensure endpoint is not cached by TTA
          console.log('bloodhound.remote.replace: mutating base url ' + url + ' and adding ' + query);
          return url + '?' + query;
        },*//*
        ajax : {
            beforeSend: function(jqXhr, settings){
               settings.data = $.param({q: airportSearchTermThrottledEncoded()})
            },
            type: "POST"

        },*/
        filter: function (airports) {
          console.log('Bloodhound.remote.filter: Found some airports!');
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
              geoNameId: airport.geoNameId,
              timeZone: airport.timezone,
              code: _filteredIATACode
            };
          });
          //console.log('Bloodhound.remote.filter: Search Query' + self.throttledAirportSearchTerm());
          console.log('Bloodhound.remote.filter: URL Fetched --v: ');
          console.log('http://api.geonames.org/searchJSON?style=full&lang=en&maxRows=20&featureClass=S&featureCode=AIRP&username=cssetian&orderby=relevance&name=');// + viewModel.airportSearchTerm());
          console.log('Bloodhound.remote.filter: Mapped Output --v');
          console.log(mappedOutput);
          return mappedOutput;
        }
      }
                           /* dataType: "jsonp",
                            data: {
                              featureClass: "S",
                              fcode: "AIRP",
                              style: "full",
                              maxRows: 12,
                              name_startsWith: request.term
                            }*/

    });

    airportSearch.initialize();

    $('#departure-airport-selector').typeahead({
      hint: true,
      highlight: true,
      minLength: 2,
      matcher: function () { return true; },
      templates: {
        empty: [
          '<div class="empty-message">',
          'unable to find any Airports that match the search term',
          '</div>'
        ].join('\n'),
        suggestion: Handlebars.compile('<div>{{name}} - {{code}}</div>'),//<div><span class=\'typeahead-airport-name\'>{{name}}</span> ({{code}})</div><div class=\'typeahead-airport-state\'><span>{{city}}, {{state}}</span> - <span class=\'typeahead-airport-country\'>{{country}}</span></div>'),
        header: '<h3>Airports</h3>'
      },
      updater: function(item) {
        console.log('TypeAhead.DepartureAirportSelector.Updater: Updated typeahead serach term! Setting viewmodel search term.');
        console.log(item);
        viewModel.airportSearchTerm(item.code);
        return item;
      },
      highlighter: function (item) {
        var regex = new RegExp( '(' + this.query + ')', 'gi' );
        return item.replace( regex, '<stronger>$1</stronger>' );
      }
    },
    {
      name: 'departureAirports',
      displayKey: 'value',
      // `ttAdapter` wraps the suggestion engine in an adapter that
      // is compatible with the typeahead jQuery plugin
      source: airportSearch.ttAdapter()
    });

    $('#arrival-airport-selector').typeahead({
      hint: true,
      highlight: true,
      minLength: 2,
      matcher: function () { return true; },
      templates: {
        empty: [
          '<div class="empty-message">',
          'unable to find any Airports that match the search term',
          '</div>'
        ].join('\n'),
        suggestion: Handlebars.compile('<div><span class=\'typeahead-airport-name\'>{{name}}</span> ({{code}})</div><div class=\'typeahead-airport-state\'><span>{{city}}, {{state}}</span> - <span class=\'typeahead-airport-country\'>{{country}}</span></div>')
      },
      updater: function(item) {
        console.log('TypeAhead.ArrivalAirportSelector.Updater: Updated typeahead serach term! Setting viewmodel search term.');
        console.log(item);
        viewModel.airportSearchTerm(item.code);
        return item;
      },
      highlighter: function (item) {
        var regex = new RegExp( '(' + this.query + ')', 'gi' );
        return item.replace( regex, '<stronger>$1</stronger>' );
      }
    },
    {
      name: 'arrivalAirports',
      displayKey: 'value',
      // `ttAdapter` wraps the suggestion engine in an adapter that
      // is compatible with the typeahead jQuery plugin
      source: airportSearch.ttAdapter()
    });

/*
    $('#departure-airport-selector.typeahead').keypress(function (e) {
      // 13 === Enter Key
      // 9  === Tab Key
      if (e.which === 13 || e.which === 9) {
          //var selectedValue = $('#departure-airport-selector.typeahead').data().ttView.dropdownView.getFirstSuggestion().datum.id;
          //$("#value_id").val(selectedValue);
          //$('form').submit();
          var selectedValue = $('#departure-airport-selector.typeahead').data().ttView.dropdownView.getFirstSuggestion().datum.id;
          $('#departureAirportId').val(selectedValue);
          return true;
      }
    });
    $('#arrival-airport-selector.typeahead').keypress(function (e) {
      // 13 === Enter Key
      // 9  === Tab Key
      if (e.which === 13 || e.which === 9) {
          var selectedValue = $('#arrival-airport-selector.typeahead').data().ttView.dropdownView.getFirstSuggestion().datum.id;
          $("#value_id").val(selectedValue);
          $('form').submit();
          return true;
      }
    });*/
    /*
    var airports = {};
    var airportLabels = [];
    $( '#typeahead-airport-input' ).typeahead({
      source: function ( query, process ) {
        console.log('hit typeahead source function!');
        searchAirportList(query, process);
        /*
        //the "process" argument is a callback, expecting an array of values (strings) to display

        //get the data to populate the typeahead (plus some) 
        //from your api, wherever that may be
        //$.get( '/api/users/search.json', { q: query }, function ( data ) {

          //reset these containers
          airports = {};
          airportLabels = [];

          //for each item returned, if the display name is already included 
          //(e.g. multiple "John Smith" records) then add a unique value to the end
          //so that the user can tell them apart. Using underscore.js for a functional approach.  
          _.each( airportList, function( item, ix, list ){
            //if ( _.contains( airports, item ) ){
              //item = item.label + ' #' + item.value;
            //}

            //add the label to the display array
            airportLabels.push( item );

            //also store a mapping to get from label back to ID
            airports[ item ] = item;
          });

          //return the display array
          process( airportLabels );  
        //});
        
       
        process(airportList);*//*
      },
      updater: function (item) {
        console.log('hit typeahead updater function!');
        //save the id value into the hidden field   
        //$('#airportId').val( airports[ item ] );
        $('#airportId').val( airportList[ item ] );

        //return the string you want to go into the textbox (e.g. name)
        return item;
      },
      matcher: function () { return true; },
      templates: {
        empty: [
          '<div class="empty-message">',
          'unable to find any Airports that match the search term',
          '</div>'
        ].join('\n'),
        suggestion: Handlebars.compile('<p><strong>{{name}}</strong> – {{code}}</p>')
      }
    });*/
  };
 
  var _initAirportRefData = function(options) {
    console.log('Initializing airport datalist and appending elements to dropdown selects');

    _.each(options.airportsJSON, function(airport) {
      options.domEls.departureAirportsList.append('<option>' + airport.name + '</option>');
      options.domEls.arrivalAirportsList.append('<option>' + airport.name + '</option>');
    });
    console.log('Completed airport datalist initialization');
  };

  var _geoLocationCallback = function(position) {
    console.log('MapModel.GeoLocationCallback: Retrieved initial position via geolocation!');
    if(!viewModel.anyAirportSelected()) {
      var _geoLocatedPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      viewModel.initialCoords(_geoLocatedPosition);
      viewModel.displaySingleMarkerOnMap(viewModel.initialMarker(), 0);
      console.log('MapModel.GeoLocationCallback: Your current location is: ' + viewModel.initialMarker().position + '! Moving map to this location.');
    } else {
      console.log('MapModel.GeoLocationCallback: User has already selected an airport, will not update default position with geolocation.');
    }
  };

  return { init: _init };
})(jQuery, _, ko);
