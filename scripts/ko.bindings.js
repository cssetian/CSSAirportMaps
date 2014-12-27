// Typeahead handler
ko.bindingHandlers.typeahead = {
  init: function (element, valueAccessor, allBindingsAccessor, bindingContext) {
    console.log('ko.bindingHandlers (' + valueAccessor().name + '): Initializing search options!');

    // HTML element that the binding was applied to, so DOM operations can be performed
    var $el = $(element);

    // A JavaScript object that you can use to access all the model values bound to this DOM element with the data-bind attribute
    var searchInput = allBindingsAccessor().value;

    // valueAccessor: A JavaScript function that you can call to get the current model property that is involved in this binding.
    //                valueAccessor in each knockout binding equals the departureSearchOptions/arrivalSearchOptions defined in the viewModel.
    // unwrap: This function will extract the observable value if an observable was bound to the value, otherwise will just return the value.
    var typeaheadOptions = ko.unwrap(valueAccessor());

    var searchOptions = CSSAirportMaps.Config.bloodhoundOptions;
    searchOptions.remote.filter = typeaheadOptions.remoteFilter;

    var bloodhoundSearchEngine = new Bloodhound(searchOptions);
    var searchPromise = bloodhoundSearchEngine
                  .initialize()
                  .done(function() { console.log('BloodhoundSearchEngine Initialization Success!'); })
                  .fail(function() { console.log('BloodhoundSearchEngine Initialization Error!'); });

    // Log all of the relevant typehaead bindings initialization data
    console.log('ko.bindingHandlers (' + valueAccessor().name + '): $el: ', $el);
    console.log('ko.bindingHandlers (' + valueAccessor().name + '): ko.unwrap(valueAccessor()): ', ko.unwrap(valueAccessor()));
    console.log('ko.bindingHandlers (' + valueAccessor().name + '): allBindingsAccessor(): ', allBindingsAccessor());
    console.log('ko.bindingHandlers (' + valueAccessor().name + '): bindingContext: ', bindingContext);
    console.log('ko.bindingHandlers (' + valueAccessor().name + '): Search Options: ', searchOptions);

    $el.typeahead({
      hint: true, // default = true
      highlight: true,
      minLength: 1, // default = 1
      autoselect: true
      //limit: 2,
    }, {
      source: bloodhoundSearchEngine.ttAdapter(), // `ttAdapter` wraps the suggestion engine in an adapter that is compatible with the typeahead jQuery plugin
      name: typeaheadOptions.name,
      displayKey: 'value',
      engine: Handlebars, // Specifies the template-rendering engine
      templates: typeaheadOptions.templates  // Provides the Handlebars templates to typeahead for the autocomplete heading, suggestion and empty situations
    }).on('typeahead:opened', typeaheadOptions.onOpened) // Register events for opening, selecting, and autocompleting search options
      .on('typeahead:selected', typeaheadOptions.onSelected)
      .on('typeahead:autocompleted', typeaheadOptions.onAutoCompleted);

    console.log('ko.bindingHandlers (' + valueAccessor().name + '): Initialization of search options complete!');
  }
};

ko.bindingHandlers.distBtwnAirports = {
  update:  function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    'use strict';
    var self = viewModel;
    var unit = valueAccessor();

    if(self.isDepartureSelected() && self.isArrivalSelected()) {
      console.log('ViewModel.distBtwnAirports: Calculating distance between airports!');

      var p1 = new LatLon(self.getAirportById(1).airportData().lat, self.getAirportById(1).airportData().lng);
      var p2 = new LatLon(self.getAirportById(2).airportData().lat, self.getAirportById(2).airportData().lng);
      var dist = p1.distanceTo(p2);
      var distanceToReturn;

      if(unit === 'M') {
        distanceToReturn = dist * 0.621371; // 0.621371 Miles per 1 Kilometer
      } else if (unit === 'NM') {
        distanceToReturn = dist * 0.539957; // 0.539957 Nautical Miles per 1 Kilometer
      } else if (unit === 'Km') {
        distanceToReturn = dist;
      } else {
        distanceToReturn = -1;
        console.log('ViewModel.distBtwnAirports: No unit of length specified.');
      }
      
      // This is getting repeated multiple times because whenever departureAirport or arrivalAirport are updated/touched at all, this recomputes
      // That incldues the tests in the HTML where it checks to see if they exist before displaying the computed distances
      var distanceToReturnTrimmed =  parseFloat(distanceToReturn).toFixed(2);
      console.log('ViewModel.distBtwnAirports: Calculated distance between airports: ' + distanceToReturnTrimmed + ' ' + unit);

      $(element).text(distanceToReturnTrimmed);
    } else {
      console.log('ViewModel.distBtwnAirports: Must select 2 airports to calculate distance!');
    }
  }
};