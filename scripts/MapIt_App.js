/*

  Statements that begin with the token function are 
    always considered to be function declarations. 
  Including () creates a function expression instead

 */
var MapIt = MapIt || {};

MapIt.App = (function($, _, ko) {

  var viewModel;
  var departureTimer = 0;
  var arrivalTimer = 0;

  var _init = function (options) {
    _initAirportRefData(options);

    viewModel = new MapIt.ViewModel();
    _initTypeAhead(options);
    /*
    ko.bindingHandlers.typeahead = {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var typeaheadSource; // <-- this is where our typeahead options will be stored in
            //this is the parameter that you pass from you data-bind expression in the mark-up
            if (typeof valueAccessor() === undefined) {
              return;
            }
            var passedValueFromMarkup = ko.utils.unwrapObservable(valueAccessor());
            if (passedValueFromMarkup instanceof Array) typeaheadSource = passedValueFromMarkup;
            else {
                // if the name contains '.', then we expect it to be a property in an object such as myLists.listOfCards
                var splitedName = passedValueFromMarkup.split('.');
                var result = window[splitedName[0]];
                $.each($(splitedName).slice(1, splitedName.length), function(iteration, name) {
                    result = result[name];
                });

                // if we find any array in the JsVariable, then use that as source, otherwise init without any specific source and hope that it is defined from attributes
                if (result != null && result.length > 0) {
                    typeaheadSource = result;
                }

            }
            if (typeaheadSource == null) $(element).typeahead();
            else {
                $(element).typeahead({
                    source: typeaheadSource
                });
            }

        },
    };
    console.log('initialized binding handler!');
  */
    var substringMatcher = function(strs) {
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

    viewModel.clientSearchResults = ko.mapping.fromJS([]);
    ko.mapping.fromJS(viewModel.departureAirport().airportSearchResults(), viewModel.clientSearchResults);

    viewModel.SearchText = ko.computed(function () {
      var searchableTerms = [];
      ko.utils.arrayForEach(viewModel.departureAirport().airportSearchResults(), function (item) {
        searchableTerms.push(item.name);
      });
      console.log('SearchableTerms:');
      console.log(searchableTerms);
      return searchableTerms;
    });

    /*
    // Bind twitter typeahead
    ko.bindingHandlers.typeahead = {
      init: function (element, valueAccessor) {//, allBindingsAccessor, viewModel, bindingContext) {
        var binding = this;

        console.log('element: ');
        console.log($(element));
        console.log('valueAccessor: ');
        console.log(valueAccessor());

        var elem = $(element);
        var value = valueAccessor();

        elem.typeahead({
          source: function () {
            return ko.utils.unwrapObservable(value.source);
          },
          onselect: function (val) {
            value.target(val);
          }
        });

        elem.blur(function () {
          value.target(elem.val());
        });
      },
      update: function (element, valueAccessor) {
        var elem = $(element);
        var value = valueAccessor();
        elem.val(value.target());
      }
    };
    */
   
/*
   ko.bindingHandlers.typeahead = {
    init: function (element, valueAccessor) {
        var options = ko.unwrap(valueAccessor()) || {},
            $el = $(element),
            triggerChange = function () {
                $el.change();
            };
            
        var displayKey = options.displayKey;
        options.displayKey = function(item) {
            return item[displayKey]();
        };
        options.dupDetector = function(remoteMatch, localMatch) {
            return false;
        };
        options.source = options.taOptions.ttAdapter();

        console.log('options local set - ', options.taOptions.ttAdapter);
        var thisTypeAhead = $el.typeahead(null, options)
          .on("typeahead:selected", triggerChange)
          .on("typeahead:autocompleted", triggerChange);
        
        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
          $el.typeahead("destroy");
          $el = null;
        });
      }
    };
*/
        /*
        $element//.attr('autocomplete', 'off')
        .typeahead({
          //'source': function (query, process) {
          //            console.log('accessing source of typeahead! Query is ' + query);
          //            return substringMatcher(query);
          //         },//typeaheadArr,
          'remote': '/airportsearch?search_query=%QUERY',
          'minLength': 2,
          'items': allBindings.typeahead,
          'displayKey': 'value',
          'updater': function(item) {
            console.log('updating typeahead!');
            allBindings.typeaheadValue(item);
            return item;
          }
        });
      }*/
      /*,
      update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var $element = $(element);
        var allBindings = allBindingsAccessor();
        console.log('valueAccessor: ' + valueAccessor());
        var typeaheadArr = ko.utils.unwrapObservable(valueAccessor());
        
        console.log('bindings handler for autocomplete update!');
        console.log('source array!:');
        console.log(typeaheadArr);
        $element//.attr('autocomplete', 'off')
        .typeahead({
          'source': typeaheadArr,
          'minLength': 2,
          'items': allBindings.typeahead,
          'updater': function(item) {
            allBindings.typeaheadValue(item);
            return item;
          }
        });

      }*/
    //};

    /*
    $('#departure-airport-selector').typeahead({
        hint: true,
        displayKey: 'value',
        name: 'Departure Airports',
        limit: 10,
        templates: {
          empty: [
            '<div class="empty-message">',
            'unable to find any Best Picture winners that match the current query',
            '</div>'
          ].join('\n'),
          suggestion: Handlebars.compile('<span><strong>{{name}}</strong></span><span>{{formatted_address}}</span>')
        },
        source: function(query, process) {
          console.log('processing source!!');
          var resultObject = viewModel.departureAirport().airportSearchResults();

          var results = _.map(resultObject, function(airport) {
            return airport.name;
          });

          console.log('airport search results - typeahead source: ' + results);
          process(results);
          console.log('source method of typeahead - finished!');
        },

        matcher: function(item) {
          console.log('processing matcher!');
          if(item.name.toLowerCase().indexOf(this.query.trim().toLowerCase()) !== -1) {
            return true;
          }
        },

        highlighter: function(item) {
          console.log('processing highlighter!');
          var regex = new RegExp( '(' + this.query + ')', 'gi' );
          return item.replace( regex, '<strong>$1</strong>' );
        },

        updater: function(item) {
          console.log('updater method of typeahead');
          console.log('"' + item + '" selected.');
          return item;
        }

      });*/
    console.log('initialized typeahead!');

    /*
    viewModel.departureAirport().airportSearchResults.subscribe(function(newSearchResults) {
      var autocomplete = $('#departure-airport-selector').typeahead();
      autocomplete.data('typeahead').source = newSearchResults;
    });
    viewModel.arrivalAirport().airportSearchResults.subscribe(function(newSearchResults) {
      var autocomplete = $('#arrival-airport-selector').typeahead();
      autocomplete.data('typeahead').source = newSearchResults;
    });
    */

    console.log('initialized typeahead results subscribe!');
    /*
    var bestPictures = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      prefetch: '../data/films/post_1960.json',
      remote: '../data/films/queries/%QUERY.json'
    });
    
    bestPictures.initialize();
    */
     /*
    $('#departure-airport-selector-container .typeahead').typeahead(null, {
      name: 'best-pictures',
      displayKey: 'value',
      source: bestPictures.ttAdapter()
    });
    */

    /*
    $('#departure-airport-selector').live('focus',function(){
      $(this).attr('autocomplete', 'off');
    });
    */
    /*
    options.domEls.departureAirportsList.unbind('dblclick');
    options.domEls.departureAirportsList.dblclick(function(e){
      console.log('DISABLING DEPARTUREAIRPORTLIST DOUBLECLICK');
      e.stopPropagation();
      e.preventDefault();
      return false;
    });
    options.domEls.departureAirportsList.unbind('click');
    options.domEls.departureAirportsList.dblclick(function(e){
      console.log('DISABLING DEPARTUREAIRPORTLIST CLICK');
      e.stopPropagation();
      e.preventDefault();
      return false;
    });

    $('#departure-airport-selector').unbind('dblclick');
    $('#departure-airport-selector').dblclick(function(e){
      console.log('DISABLING DEPARTUREAIRPORT DOUBLECLICK');
      e.stopPropagation();
      e.preventDefault();
      return false;
    });
    $('#departure-airport-selector').unbind('click');
    $('#departure-airport-selector').click(function(e){
      console.log('DISABLING DEPARTUREAIRPORT CLICK');
      e.stopPropagation();
      e.preventDefault();
      return false;
    });
    */
    /*
    $('#departure-airport-selector').autocomplete({
      source: viewModel.makeRequest,
      minLength: 2
    });
    */
   /*
    $('#departure-airport-selector').off('ondblclick');
    $('#arrival-airport-selector').off('ondblclick');
    */

    // If geolocation is available in this browser, set the initial marker to that person's location
    // Otherwise, set location to Manhattan
    if ('geolocation' in navigator) {
      console.log('MapModel.init: Found Geolocation!');
      navigator.geolocation.getCurrentPosition(_geoLocationCallback);
    } else {
      console.log('MapModel.init: Geolocation not available!');
    }

    console.log('Creating initial position for map');
    var _initialLatLong = new google.maps.LatLng(40.7056308,-73.9780035);
    viewModel.initialPosition(_initialLatLong);
    viewModel.mapMarkerArray()[0].marker.setPosition(viewModel.initialPosition());

    console.log('Initializing map!');
    viewModel.map().setZoom(10);
    viewModel.map().setCenter(viewModel.initialPosition());
    console.log('Initialized map with default position in Manhattan: ' + viewModel.mapMarkerArray()[0].marker.position);//+ viewModel.initialPosition());

    ko.applyBindings(viewModel);
    options.domEls.appContainer.fadeIn(50);
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
      viewModel.mapMarkerArray()[0].marker.setPosition(_geoLocatedPosition);

      viewModel.initialPosition(_geoLocatedPosition);
      console.log('MapModel.GeoLocationCallback: Your current location is: ' + viewModel.initialPosition() + '!');

      console.log('MapModel.GeoLocationCallback: Moving center of map to: ' + viewModel.initialPosition());
      viewModel.map().panTo(viewModel.initialPosition());
    } else {
      console.log('MapModel.GeoLocationCallback: User has already selected an airport, will not update default position with geolocation.');
    }
  };

  var _initTypeAhead = function(options) {/*
    var airports = {};
    var airportLabels = [];

    $( options.domEls.departureAirportSelector).typeahead({
      //The source() function is responsible for taking the input from the text field, using it to get results to display, and passing those results to process().
      source: function ( query, process ) {

        //the "process" argument is a callback, expecting an array of values (strings) to display
        var searchAirports = _.debounce(function(query, process){
          //get the data to populate the typeahead (plus some) 
          //from your api, wherever that may be
          $.get( '/airportsearch', { airportSearchQuery: query }, function ( data ) {

            //reset these containers
            airports = {};
            airportLabels = [];

            //for each item returned, if the display name is already included 
            //(e.g. multiple "John Smith" records) then add a unique value to the end
            //so that the user can tell them apart. Using underscore.js for a functional approach.  
            _.each( data, function( item, ix, list ){
              if ( _.contains( airports, item.label ) ){
                item.label = item.label + ' #' + item.value;
              }

              //Add the label to the display array
              airportLabels.push( item.label );

              //Since we're going to be converting a string back to an ID once a record is selected, we save a hash-table with the name as the key
              airports[ item.label ] = item.value;
            });

            //The display array is what you pass along in the sequence of events to display in the dropdown
            process( airportLabels );
          });
        });
      },
      // The updater()function is called when an item is selected, and the selected item's label is passed to it.
      updater: function (item) {
        //We store that person ID into the hidden form field, and then return the string that we want to be placed into the textbox; in this case the name of the person.
        $(options.domEls.hiddenDepartureAirportSelector).val( airports[ item ] );

        //return the string you want to go into the textbox (e.g. name)
        return item;
      },
      matcher: function ( item ) { return true; }
    }, 300);
*/};

  return { init: _init };
})(jQuery, _, ko);
