// App class for CSSAirportMaps Site. Initializes the site, sets up the viewmodel, and applies the  knockout bindings

var CSSAirportMaps = CSSAirportMaps || {};

CSSAirportMaps.App = (function($, _, ko) {
  'use strict';
  var viewModel;

  var _init = function (options) {
    console.log('App.Init: Initializing CSSAirportMaps!');

    // Register handlebar helpers to render templates
    CSSAirportMaps.Config.registerHandlebarHelpers();

    // Instantiate and initialize the viewmodel
    viewModel = new CSSAirportMaps.ViewModel(options);
    viewModel.initialize();
    
    // Initial display location hard-coded to newark international airport
    var initialAirportDisplayData = {
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
    var initialAirportParams = {
      id: 0,
      name: 'Newark Airport (HardCoded)',
      airportData: initialAirportDisplayData
    };

    // Create the initial airport to be displayed when no other airports are selected
    var initialAirport = new CSSAirportMaps.Airport(viewModel.map(), initialAirportParams);
    viewModel.addAirport(initialAirport);
    console.log('App.Init: Adding default, hard-coded initial airport (' + initialAirport.name + ') to map at: ' +  initialAirport.airportCoords());
    
    // Pan and zoom to hard coded initial airport and set the initial airport viewModel property
    console.log('App.Init: Panning and zooming to default, non-located coordinates');
    viewModel.positionAndZoomToAirport(initialAirport);
    viewModel.initialAirport(initialAirport);

    // Apply bindings and fade in main app element
    ko.applyBindings(viewModel);
    options.domEls.appContainer.fadeIn(500).removeClass('hidden');
  };
 
  // This string fetches airports by their IATA code
  var geoNamesAirportCodeBasedURLBase = 'http://api.geonames.org/searchJSON?style=full&lang=en&maxRows=20&featureClass=S&featureCode=AIRP&username=cssetian&fuzzy=0.8&q=sfo&orderby=relevance';
  var geoNamesURLBase = 'http://api.geonames.org/searchJSON?lang=en&code=AIRP&maxRows=20&username=cssetian&q=%QUERY';

  return { init: _init };
})(jQuery, _, ko);