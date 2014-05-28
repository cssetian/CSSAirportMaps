/*

  Statements that begin with the token function are 
    always considered to be function declarations. 
  Including () creates a function expression instead

 */
var MapIt = MapIt || {};

MapIt.App = MapIt.App || (function($, ko, google){
  'use strict';

  var viewModel, map;

  var _init = function (options) {
    var domEls = options.domEls;

    map = initMap();
    //map = MapIt.MapModel.init();
    
    viewModel = new MapIt.ViewModel(map);


    initAirports(options);


    ko.applyBindings(viewModel);
    
    
    domEls.appContainer.fadeIn(100);

  };

  var initAirports = function(options) {
    console.log('Initializing airport datalist and appending elements to dropdown selects');

    _.each(options.airportsJSON, function(airport) {
      options.domEls.departureAirportsList.append('<option>' + airport.name + '</option>');
      options.domEls.arrivalAirportsList.append('<option>' + airport.name + '</option>');
    });
    console.log('Completed airport datalist initialization');
  };

  var initMap = function() {
    console.log('Initializing the Google Map!');

    var myLatLong = {};
    if ('geolocation' in navigator) {
      var positionPrivate = {};
      /* geolocation is available */
      navigator.geolocation.getCurrentPosition(function(position) {
        positionPrivate = {'lat': position.coords.latitude, 'lon': position.coords.longitude};
        myLatLong = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        console.log('Geolocation found! Initial position is: (' + position.coords.latitude + ', ' + position.coords.longitude + ')');
      });
      myLatLong = new google.maps.LatLng(40.7056308,-73.9780035);
    } else {
      /* geolocation IS NOT available */
      myLatLong = new google.maps.LatLng(40.7056308,-73.9780035);
      console.log('Geolocation not found! Defualt Initial position is: (40.7127, 74.0059)');
    }

    var mapOptions = {
      zoom: 4,
      center: myLatLong
    };

    var mymap = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    return mymap;
  };

  return { init: _init };
})(jQuery, ko, google);