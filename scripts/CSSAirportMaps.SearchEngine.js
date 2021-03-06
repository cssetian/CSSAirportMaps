CSSAirportMaps.SearchEngine = function(options) {
  'use strict';
  // Initialize the Bloodhound search engine
  var self = this;
  self.id = options.id;
  self.name = options.name;
  console.log('SearchEngine: Initializing Bloodhound engine for ' + self.name);

  // Map bloodhound search results to airport JSON objects that can be fed into the autocomplete
  self.mapSearchResults = function(bloodhoundSearchResultObj) {
    console.log('SearchEngine.mapSearchResults: Mapping Search Results');

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
        city: airportSearchResultItem.adminName2,
        state: airportSearchResultItem.adminName1,
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

  self.remoteFilter = function(bloodhoundSearchResultObj) {
    console.log('SearchEngine.remoteFilter: Completed Bloodhound Search! Found ' + bloodhoundSearchResultObj.totalResultsCount + ' airport(s)!', bloodhoundSearchResultObj);
    var mappedSearchResults = self.mapSearchResults(bloodhoundSearchResultObj);
    console.log('SearchEngine.remoteFilter: Mapped Results: ', mappedSearchResults);
    return mappedSearchResults;
  };

};