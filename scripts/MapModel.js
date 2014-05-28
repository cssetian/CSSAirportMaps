MapIt.MapModel = MapIt.MapModel || (function(ko, google) {

  var self = this;

  var _init = function() {
    console.log('Initializing the Map Model!');

    var initialLatLong = {};
    if ('geolocation' in navigator) {
      var positionPrivate = {};

      /*
      var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      };
      var success = function(pos) {
        var crd = pos.coords;
        viewModel.currentPoint(pos.latitude);
        console.log(currentPoint);
        console.log('Your current position is:');
        console.log('Latitude : ' + crd.latitude);
        console.log('Longitude: ' + crd.longitude);
        console.log('More or less ' + crd.accuracy + ' meters.');
      };
      var error = function(err) {
        console.log('got to the error');
        console.warn('ERROR(' + err.code + '): ' + err.message);
      };
      navigator.geolocation.getCurrentPosition(success, error, options);


      // geolocation is available
      initialLatLong = navigator.geolocation.getCurrentPosition(function(position) {
        positionPrivate = {'lat': position.coords.latitude, 'lon': position.coords.longitude};
        initialLatLong = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        console.log('Geolocation found! Initial position is: (' + position.coords.latitude + ', ' + position.coords.longitude + ')');
        return initialLatLong;
      });*/
      initialLatLong = new google.maps.LatLng(40.7056308,-73.9780035);
    } else {
      /* geolocation IS NOT available */
      initialLatLong = new google.maps.LatLng(40.7056308,-73.9780035);
      console.log('Geolocation not found! Defualt Initial position is: (40.7056308,-73.9780035)');
    }

    var mapOptions = {
      zoom: 10,
      center: initialLatLong
    };

    console.log('Finished initializing the Map model!');
    var newMap = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    return newMap;
  };

  self.plotDepartureMarker = ko.computed({
    read: function() {
      console.log('Somehow plot the updated point now that you\'ve selected it in the viewModel');
    },
    owner: self,
    deferEvaluation: true
  });

  return { init: _init};
})(ko, google);