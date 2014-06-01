//(function(ko, google) {
//    'use strict';
/*
  var MapIt = MapIt || {};
  MapIt.MapModel = MapIt.MapModel || {};
*/
  MapIt.MapModel = function() {
    var self = this;

    self.map = ko.observable();

    self.initialPosition = ko.observable();
    self.departurePosition = ko.observable();
    self.arrivalPosition = ko.observable();

    self.departureMarker = ko.computed({
      read: function() {
        var _departureMarker =  new google.maps.Marker({
          position: self.departurePosition(),
          map: self.map()
        });

        console.log('MapModel.departureMarker: Recomputing departureMarker to: ' + self.departurePosition());
        return _departureMarker;
      },
      owner: self
    });

    self.arrivalMarker = ko.computed({
      read: function() {
        var _arrivalMarker =  new google.maps.Marker({
          position: self.arrivalPosition(),
          map: self.map()
        });

        console.log('MapModel.arrivalMarker: Recomputing arrivalMarker to: ' + self.arrivalPosition());
        return _arrivalMarker;
      },
      owner: self
    });

    self.initialMarker = ko.computed({
      read: function() {
        var _initialMarker = new google.maps.Marker({
          position: self.initialPosition(),
          map: self.map()
        });

        console.log('MapModel.initialMarker: Recomputing initialMarker to: ' + self.initialPosition());
        return _initialMarker;
      }
    });

    var _initMapCallback = function(position) {
      console.log('MapModel.initMapCallback: Retrieved initial position via geolocation');

      self.initialMarker().setMap(null);
      self.initialPosition(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
      console.log('MapModel.initMapCallback: Your current location is: ' + self.initialPosition() + '!');

      console.log('MapModel.initMapCallback: Moving center of map');
      self.map().setCenter(self.initialPosition());


    };

    var _init = function() {
      console.log('MapModel.init: Initializing MapModel!');

      // If geolocation is available in this browser, set the initial marker to that person's location
      // Otherwise, set location to Manhattan
      if ('geolocation' in navigator) {
        console.log('MapModel.init: Found Geolocation!');
        navigator.geolocation.getCurrentPosition(_initMapCallback);
      } else {
        console.log('MapModel.init: Geolocation not available!');
      }

      var _initDefaultLatLong = new google.maps.LatLng(40.7056308,-73.9780035);
      self.initialPosition(_initDefaultLatLong);

      var mapOptions = {
        zoom: 10,
        center: self.initialPosition()
      };
      self.map(new google.maps.Map(document.getElementById('map-canvas'), mapOptions));

      console.log('MapModel.init: Could not find Geolocation! Defualt Initial position is: ' + self.initialPosition());
    

    };




    // This is the list of coordinate points in existance on the map
    // Data construct, not visual object
    // Implement map after hard-dependency solution works
    //self.mapPoints = ko.observableArray();

    // These are the red markers that appear on the Google Map
    // Computed observable causes this to depend on the mapPoints
    //      and autmatically update when they do
    // Implement map after hard-dependency solution works
    /*
    self.mapMarkers = ko.computed({
      read: function(){
        var _mapMarkersToReturn = [];

        // Loop through all the points and return them in Marker form
        for(var point in self.mapPoints()) {
          console.log('Map Point: ' + point);
          var _mapMarker = new google.maps.Marker({
            position: point,
            map: self.map()
          });
          _mapMarkersToReturn.push(_mapMarker);
        }
        return _mapMarkersToReturn;
      }
    });*/

    // Because map markers need to be applied to the map
    //    we need a 'rendering' method just for the markers
    //    so that when the mapPoints object changes, we clear
    //    all of the points from the map and redraw them
    // Implement map after hard-dependency solution works
    /*
    self.mapMarkers.subscribe(function(){
      
      var _returnMarkers = [];
      self.deleteMarkers();

      for(var marker in self.mapMarkers()) {

      }
      return _returnMarkers;
      
    }, self);
    */
   
    /*
    
    // Implement init function for array of maps after hard-dependencies
    var _init = function() {
      console.log('Initializing the Map Model!');

      if ('geolocation' in navigator) {
        // geolocation is available in this browser! Set the initial marker to that person's location
        navigator.geolocation.getCurrentPosition(_initializeCurrentPositionCallback);
      } else {
        // geolocation IS NOT available
        var _initialLatLong = new google.maps.LatLng(40.7056308,-73.9780035);
        self.initialPosition(_initialLatLong);
        console.log('Could not find Geolocation! Defualt Initial position is: ' + self.initialPosition());
      }

      console.log('Finishied Iniialization!');
    };
    google.maps.event.addDomListener(window, 'load', _init);
    */

    // Add a marker to the map and push to the array.
    // Input type: google.maps.LatLng()
    // Implement array of markers after hard-dependencies
    /*
    var addMarker = function(location) {
      /*
      var marker = new google.maps.Marker({
        position: location(),
        map: self.map()
      });
      self.mapMarkers().push(marker);
      */
     /*
      self.mapPoints().push(location);
    };
    */
   
    /*
    // These functions will help for adding and removing markers from an array when array solution is implemented
     
    // Sets the map on all markers in the array.
    var setAllMap = function(map) {
      for (var i = 0; i < self.mapMarkers().length; i++) {
        self.mapMarkers()[i].setMap(self.map());
      }
    };

    // Removes the markers from the map, but keeps them in the array.
    var clearMarkersFromMap = function() {
      setAllMap(null);
    };

    // Shows any markers currently in the array.
    var showMarkers = function() {
      setAllMap(self.map());
    };

    // Deletes all markers in the array by removing references to them.
    var deleteMarkers = function() {
      clearMarkersFromMap();
      self.mapMarkers([]);    // Delete refernces to the markers
    };
    */

    /****** INITIAL POSITION CALLBACK *******/
    /*
    var _initializeCurrentPositionCallback = function (position) {
      self.initialPosition(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));

      var mapOptions = {
        zoom: 10,
        center: self.initialPosition()
      };
      self.map(new google.maps.Map(document.getElementById('map-canvas'), mapOptions));

      self.mapPoints().push(self.initialPosition());
      //self.mapMarkers().push(self.initialPosition());
      var marker = new google.maps.Marker({
        position: self.initialPosition(),
        map: self.map(),
        title: 'Here You Are!'
      });

      console.log('Geolocation found! Initial position is: ' + self.initialPosition());
    };
    */
    /******************************************/

    return { init: _init};
  };

//})(ko, google);