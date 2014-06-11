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

    viewModel = new MapIt.ViewModel(options);

   // _initTypeAhead();


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
    options.domEls.appContainer.fadeIn(500).removeClass('hidden');
  };
 
  // This string fetches airports by their IATA code
  var geoNamesAirportCodeBasedURLBase = 'http://api.geonames.org/searchJSON?style=full&lang=en&maxRows=20&featureClass=S&featureCode=AIRP&username=cssetian&fuzzy=0.8&q=sfo&orderby=relevance';
  var geoNamesURLBase = 'http://api.geonames.org/searchJSON?lang=en&code=AIRP&maxRows=20&username=cssetian&q=%QUERY';
 
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
