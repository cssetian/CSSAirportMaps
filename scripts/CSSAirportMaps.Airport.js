CSSAirportMaps.Airport = function(map, options) {
  'use strict';
  console.log('CSSAirportMaps.Airport: Initializing Airport ViewModel for ' + options.name);
  var self = this;

  self.id = options.id;
  self.name = options.name;

  self.isSelected = ko.observable(false);
  self.isSearchActive = ko.observable(false);
  
  self.airportData = ko.observable(options.airportData);
  self.airportCoords = ko.computed({
    read: function() {
      return new google.maps.LatLng(parseFloat(self.airportData().lat, 10), parseFloat(self.airportData().lng, 10));
    },
    owner: self
  });
  self.airportMarker = ko.computed({
    read: function() {
      return new google.maps.Marker({map: map, position: self.airportCoords(), title: self.name + ': Blah'});
    },
    owner: self
  });
};

