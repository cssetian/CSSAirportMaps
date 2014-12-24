CSSAirportMaps.SearchEngine = function(options) {
  // Initialize the Bloodhound search engine
  console.log('SearchEngine.body: Initializing Bloodhound engine');
  var self = this;

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
    console.log('************************* COMPLETED BLOODHOUND AIRPORT SEARCH EXECUTION ****************************');
    console.log('SearchEngine.remoteFilter: (Bloodhound Callback) Found ' + bloodhoundSearchResultObj.length + ' airport(s)! (Obj copied below) ---v');
    console.log(bloodhoundSearchResultObj);

    console.log('SearchEngine.remoteFilter: Mapping results!');
    var mappedSearchResults = self.mapSearchResults(bloodhoundSearchResultObj);

    console.log('SearchEngine.remoteFilter: (Bloodhound Callback) Mapped Output (Obj copied below) --v');
    console.log(mappedSearchResults);
    return mappedSearchResults;
  };

};