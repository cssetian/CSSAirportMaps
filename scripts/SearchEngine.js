(function(){
MapIt.SearchEngine = function(options) {
  // Initialize the Bloodhound search engine
  console.log('SearchEngine.body: Initializing Bloodhound engine');
  var self = this;

  // Hard-code the options for now, only need 1 kind of search engine
  /*
  var suggestionTemplates = {
      empty: [
        '<div class="empty-message">',
        'Unable to find any Airports that match the search.',
        '</div>'
      ].join('\n'),
      suggestion: Handlebars.compile([
        '<div>',
        '<span class=\'typeahead-airport-name\'>{{name}} - ({{code}})</span>',
        '</div>',
        '<div> {{#isnotnull city}}',
        '<span class=\'typeahead-airport-state\'>{{city}}, {{state}}</span> - <span class=\'typeahead-airport-country\'>{{country}}</span>',
        '{{else}}{{#isnotnull state}}',
        '<span class=\'typeahead-airport-state\'>{{state}}</span> - <span class=\'typeahead-airport-country\'>{{country}}</span>',
        '{{else}}',
        'å<span class=\'typeahead-airport-country\'>{{country}}</span>',
        '{{/isnotnull}}{{/isnotnull}}</div>'
      ].join('\n')),
      header: '<h3>Select An Airport</h3>'
  };

  self.search = new Bloodhound(MapIt.Config.bloodhound_options());

  var searchPromise = self.search.initialize();
  searchPromise.done(function() { console.log('success!'); })
               .fail(function() { console.log('err!'); });
*/

  self.mapSearchResults = function(bloodhoundSearchResultObj) {

    // Map the properties of the returned geoplanet data to the viewmodel properties
    var mappedOutputPreFiltering = $.map(bloodhoundSearchResultObj.geonames, function (airportSearchResultItem) {

      // Attempt to match the name of one of the alternateNames in a geoData result item to the official airport code name (IATA)
      var _IATACode = _.filter(airportSearchResultItem.alternateNames, function(alternateNamesItem) {
        return alternateNamesItem.lang === 'iata';
      });
      var _filteredIATACode = '';
      if(typeof _IATACode !== 'undefined' && _IATACode.length > 0) {
        _filteredIATACode = _IATACode[0].name;
      }

      // Return a new json object where only the relevant properties are kept and mapped
      return {
        value: airportSearchResultItem.toponymName,
        name: airportSearchResultItem.toponymName,
        lat: airportSearchResultItem.lat,
        lng: airportSearchResultItem.lng,
        city: airportSearchResultItem.adminName1,
        country: airportSearchResultItem.countryName,
        countryCode: airportSearchResultItem.countryCode,
        adminId1: airportSearchResultItem.adminId1,
        geoNameId: airportSearchResultItem.geonameId,
        timeZone: airportSearchResultItem.timezone,
        code: _filteredIATACode,
        id: options.id
      };
    });

    // Filter out airports lacking IATA codes - they're probably not legit
    var mappedOutput = _.filter(mappedOutputPreFiltering, function(item) {
      return (typeof item.code !== 'undefined' && item.code !== null && item.code !== '');
    });
    return mappedOutput;
  };

  
  self.filterAndMapSearchResults = function(bloodhoundSearchResultObj) {
    console.log('************************* COMPLETED BLOODHOUND AIRPORT SEARCH EXECUTION ****************************');
    console.log('SearchEngine.remoteFilter: (Bloodhound Callback) Found ' + bloodhoundSearchResultObj.length + ' airport(s)! (Obj copied below) ---v');
    console.log(bloodhoundSearchResultObj);

    console.log('SearchEngine.remoteFilter: Mapping results!');
    var mappedSearchResults = self.mapSearchResults(bloodhoundSearchResultObj);

    console.log('SearchEngine.remoteFilter: (Bloodhound Callback) Mapped Output (Obj copied below) --v');
    console.log(mappedSearchResults);
    return mappedSearchResults;
  };


return {  remoteFilter: self.filterAndMapSearchResults,
          search: self.search,
          mapSearchResults: self.mapSearchResults
        };
};
})();