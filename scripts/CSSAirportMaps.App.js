// App class for CSSAirportMaps Site. Initializes the site, sets up the viewmodel, and applies the  knockout bindings

var CSSAirportMaps = CSSAirportMaps || {};

CSSAirportMaps.App = (function($, _, ko) {

  var viewModel;
  var _initialMarker;

  var _init = function (options) {
    console.log('Initializing CSSAirportMaps!');

    CSSAirportMaps.Config.registerHandlebarHelpers();

    viewModel = new CSSAirportMaps.ViewModel(options);
    viewModel.initialize();

    // If geolocation is available in this browser, set the initial marker to that person's location
    // Otherwise, set location to a default airport
    if ('geolocation' in navigator) {
      console.log('CSSAirportMapsApp.init: Found Geolocation!');
      navigator.geolocation.getCurrentPosition(_geoLocationCallback);
    } else {
      console.log('CSSAirportMapsApp.init: Geolocation not available!');
    }

    var _initialDefaultAirport = new CSSAirportMaps.Airport(viewModel.map(), {name: 'Newark Airport (HardCoded)', id: 0, airportData: {name: 'Initial Airport: Start here Data', lat: 34.5, lng: 75.5}});
    viewModel.addAirport(_initialDefaultAirport);
    console.log('CSSAirportMaps.Init: Adding default, non-located marker to map! Location at: <' +  viewModel.getAirportById(0).airportMarker().position + '>');
    
    console.log('CSSAirportMaps.Init: Panning and zooming to default, non-located coordinates');
    viewModel.positionAndZoomToAirport(_initialDefaultAirport);
    viewModel.initialAirport(_initialDefaultAirport);

    ko.applyBindings(viewModel);
    options.domEls.appContainer.fadeIn(500).removeClass('hidden');
  };
 
  // This string fetches airports by their IATA code
  var geoNamesAirportCodeBasedURLBase = 'http://api.geonames.org/searchJSON?style=full&lang=en&maxRows=20&featureClass=S&featureCode=AIRP&username=cssetian&fuzzy=0.8&q=sfo&orderby=relevance';
  var geoNamesURLBase = 'http://api.geonames.org/searchJSON?lang=en&code=AIRP&maxRows=20&username=cssetian&q=%QUERY';
 

  var _geoLocationCallback = function(position) {
    console.log('CSSAirportMaps.Init.GeoLocationCallback: Retrieved initial position via geolocation!');
    if(viewModel.airportCollection().length > 0 && viewModel.airportCollection()[0].id === 0) {
      var _geoLocatedPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

      // Hard Code closest airport for now -- deal with figuring out closest airport after everything actually works
      var _geoLocatedInitialAirportDisplayData = {
        value: 'Newark International Airport',
        name: 'Newark International Airport',
        lng: -74.17883,
        lat: 40.69125,
        city: 'New Jersey',
        country: 'United States',
        countryCode: 'US',
        adminId1: 'NJ',
        geoNameId: '5101809',
        timeZoneId: 'America/New_York',
        code: 'EWR'
      };

      var _geoLocatedInitialAirport = new CSSAirportMaps.Airport(viewModel.map(),
                                  { name: 'Your Default Airport: Newark Airport',
                                    id: 0,
                                    airportData: _geoLocatedInitialAirportDisplayData
                                  });

      // Update initial airport to the new, geolocated one
      viewModel.removeAirportById(0);
      viewModel.addAirport(_geoLocatedInitialAirport);
      console.log('CSSAirportMaps.Init: Adding default geolocated marker to map! Location at: <' +  viewModel.getAirportById(0).airportMarker().position + '>');
      
      console.log('CSSAirportMaps.Init: Panning and zooming to default geolocated coordinates');
      viewModel.positionAndZoomToAirport(_geoLocatedInitialAirport);
      viewModel.initialAirport(_geoLocatedInitialAirport);

      var test = viewModel.getAirportById(0);
      console.log('CSSAirportMaps.GeoLocationCallback: Your current location is: <' + _geoLocatedInitialAirport.airportMarker().position + '>! Moving map to this location.');
    } else {
      console.log('CSSAirportMaps.GeoLocationCallback: User has already selected an airport, will not update default position with geolocation.');
    }
  };

  return { init: _init };
})(jQuery, _, ko);