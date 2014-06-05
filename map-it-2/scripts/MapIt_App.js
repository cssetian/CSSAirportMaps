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





  var _initTypeAhead = function(options) {
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

  return { init: _init };
})(jQuery, _, ko);
