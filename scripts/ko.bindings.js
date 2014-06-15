(function() {

  // Typeahead handler
  ko.bindingHandlers.typeahead = {
    init: function (element, valueAccessor, allBindingsAccessor, bindingContext) {

      // Initialize the Bloodhound search engine
      console.log('SearchEngine.body: Initializing Bloodhound engine');
      var mapSearchResults = function(bloodhoundSearchResultObj) {

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

          var myId = allBindingsAccessor().airportId;

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
            id: myId
          };
        });

        // Filter out airports lacking IATA codes - they're probably not legit
        var mappedOutput = _.filter(mappedOutputPreFiltering, function(item) {
          return (typeof item.code !== 'undefined' && item.code !== null && item.code !== '');
        });
        return mappedOutput;
      };

      var remoteFilter = function(bloodhoundSearchResultObj) {
        console.log('************************* COMPLETED BLOODHOUND AIRPORT SEARCH EXECUTION ****************************');
        console.log('SearchEngine.remoteFilter: (Bloodhound Callback) Found ' + bloodhoundSearchResultObj.length + ' airport(s)! (Obj copied below) ---v');
        console.log(bloodhoundSearchResultObj);

        console.log('SearchEngine.remoteFilter: Mapping results!');
        var mappedSearchResults = mapSearchResults(bloodhoundSearchResultObj);

        console.log('SearchEngine.remoteFilter: (Bloodhound Callback) Mapped Output (Obj copied below) --v');
        console.log(mappedSearchResults);
        return mappedSearchResults;
      };

        // Hard-code the options for now, only need 1 kind of search engine
        self.bloodhoundOptions = {
          datumTokenizer: function (d) {
            return Bloodhound.tokenizers.whitespace(d.name);
            // When it's working, try tokenizing multiple fields of the objects
            //return arr.concat(Bloodhound.tokenizers.whitespace(d.name), Bloodhound.tokenizers.whitespace(d.city), Bloodhound.tokenizers.whitespace(d.country), Bloodhound.tokenizers.whitespace(d.code));
          },
          queryTokenizer: Bloodhound.tokenizers.whitespace,
          limit: 20,
          log_successful_searches: true,
          log_failed_searches: true,
          remote: {
            url: 'http://api.geonames.org/searchJSON?style=full&lang=en&maxRows=20&featureClass=S&featureCode=AIRP&username=cssetian&orderby=relevance&name=%QUERY',
            filter: remoteFilter
          }
        };
      var search = new Bloodhound(bloodhoundOptions);

      var searchPromise = search.initialize();
      searchPromise.done(function() { console.log('success!'); })
                   .fail(function() { console.log('err!'); });

        // HTML element that the binding was applied to, so DOM operations can be performed
        var $e = $(element);

        // A JavaScript object that you can use to access all the model values bound to this DOM element with the data-bind attribute
        var searchInput = allBindingsAccessor().value;

        // valueAccessor: A JavaScript function that you can call to get the current model property that is involved in this binding.
        // unwrap: This function will extract the observable value if an observable was bound to the value, otherwise will just return the value
        var options = ko.unwrap(valueAccessor());

        console.log('ko.bindings.init: Initializing typeahead custom binding!');
        console.log('element: ');
        console.log($e);
        console.log('valueAccessor() unwrapped');
        console.log(valueAccessor());
        console.log(ko.unwrap(valueAccessor()));
        console.log('allBindingsAccessor');
        console.log(allBindingsAccessor());
        console.log('bindingContext');
        console.log(bindingContext);


        $e.typeahead({
            updater: function(item) {
              console.log('ViewModel.departureTypeahead.Updater: Updater method for typeahead! Just returning item --v');
              console.log(item);
              options.searchInputVal(item);
              return item;
            },
            highlighter: function (item) {
              console.log('ViewModel.departureTypeahead.Highlighter: Highlighting via regex and returning item.');
              var regex = new RegExp( '(' + this.query + ')', 'gi' );
              return item.replace( regex, '<stronger>$1</stronger>' );
            },
            response: function( event, ui ) {
              console.log('ViewModel.departureTypeahead.Response: Response method for typeahead! Returning true and logging event and ui --v');
              console.log(event);
              console.log(ui);
              return true;
            }}, {
            hint: true,
            highlight: true,
            //minLength: 2,
            // `ttAdapter` wraps the suggestion engine in an adapter that
            // is compatible with the typeahead jQuery plugin
            source: search.ttAdapter(),//options.source,
            name: options.name,
            displayKey: 'value',
            engine: Handlebars,
            templates: options.templates
          }).on('typeahead:opened', options.onOpened)
            .on('typeahead:selected', options.onSelected)
            .on('typeahead:autocompleted', options.onAutoCompleted);

        console.log('ko.bindings.init: Typeahead initialization complete!');
      }
  };

})();