/*

  Statements that begin with the token function are 
    always considered to be function declarations. 
  Including () creates a function expression instead

 */
var MapIt = MapIt || {};

MapIt.App = (function($, _, ko) {
  //'use strict';
  //var self = this;
  //self._map = {};
  //self._viewModel = {};

  var _initAirportRefData = function(options) {
    console.log('Initializing airport datalist and appending elements to dropdown selects');

    _.each(options.airportsJSON, function(airport) {
      options.domEls.departureAirportsList.append('<option>' + airport.name + '</option>');
      options.domEls.arrivalAirportsList.append('<option>' + airport.name + '</option>');
    });
    console.log('Completed airport datalist initialization');
  };

  var _init = function (options) {
    _initAirportRefData(options);

    var map = new MapIt.MapModel().init();
    var viewModel = new MapIt.ViewModel(map);


    ko.applyBindings(viewModel);
    options.domEls.appContainer.fadeIn(50);
  };


  /*
  var _initMap = function() {
    console.log('Initializing the Google Map!');

    // beginning of an inner function block
    var initialLatLongMarker;
    if ('geolocation' in navigator) {

      // geolocation is available 
      initialLatLongMarker = navigator.geolocation.getCurrentPosition(function(position) {
        //_initialLatLongMarker = {'lat': position.coords.latitude, 'lon': position.coords.longitude};
        var _initialLatLongMarker = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        console.log('Geolocation found! Initial position is: (' + _initialLatLongMarker.lat + ', ' + _initialLatLongMarker.lon + ')');
        return _initialLatLongMarker;
      });
      //initialLatLong = new google.maps.LatLng(40.7056308,-73.9780035);
    } else {
      // geolocation IS NOT available
      initialLatLongMarker = new google.maps.LatLng(40.7056308,-73.9780035);
      console.log('Geolocation <not></not> found! Defualt Initial position is: (40.7127, 74.0059)');
    }

    var mapOptions = {
      zoom: 4,
      cen
    var mymap = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);ter: initialLatLongMarker
    };
    return mymap;
    //End of inner comment block/
   
    var _myMap = MapIt.MapModel();
    _myMap.init();

    return _myMap;
  };
  */
  return { init: _init };
})(jQuery, _, ko);

//})(jQuery, ko, google);