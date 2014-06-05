var Debug = (function() {


  var self = this;
  var airports = {};
  var airportLabels = [];
  self.airportTextSearchBaseUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json?&name=airport&types=airport&sensor=false&key=AIzaSyC_i9CE-MZrDZDLY9MdrfukhcEBkatg3Jc';
  

  var _init = function() {
    console.log('Calling init on debug!');
    return self;
  };
  

  $('#departure-airport-selector').typeahead({
      source: function ( query, process ) {
        searchAirports( query, process );
      }
  });

  self.searchAirports = _.debounce(function( query, process ){
    $.get( self.airportTextSearchBaseUrl, { query: query }, function ( data ) {

      airports = {};
      airportLabels = [];

      _.each( data, function( item, ix, list ){
        if ( _.contains( users, item.label ) ){
          item.label = item.label + ' #' + item.value;
        }
        airportLabels.push( item.label );
        airports[ item.label ] = item.value;
      });
      process( airportLabels );
    });
  }, 300);

  return { init: _init };
});