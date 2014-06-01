
// MapModel no longer needed currently - all updates are handled in viewmodel
/*
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

  return { init: _init};
};
*/