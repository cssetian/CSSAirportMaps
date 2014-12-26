// Typeahead handler
ko.bindingHandlers.typeahead = {
  init: function (element, valueAccessor, allBindingsAccessor, bindingContext) {
    console.log('ko.bindingHandlers (' + valueAccessor().name + '): Initializing search options!');

    // HTML element that the binding was applied to, so DOM operations can be performed
    var $el = $(element);

    // A JavaScript object that you can use to access all the model values bound to this DOM element with the data-bind attribute
    var searchInput = allBindingsAccessor().value;

    // valueAccessor: A JavaScript function that you can call to get the current model property that is involved in this binding.
    // unwrap: This function will extract the observable value if an observable was bound to the value, otherwise will just return the value
    var options = ko.unwrap(valueAccessor());

    var searchOptions = CSSAirportMaps.Config.bloodhoundOptions;
    searchOptions.remote.filter = options.remoteFilter;
    var search = new Bloodhound(searchOptions);
    var searchPromise = search.initialize();
    searchPromise.done(function() { console.log('success!'); })
                 .fail(function() { console.log('err!'); });

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
      limit: 2,
    }, {
      source: search.ttAdapter(), // `ttAdapter` wraps the suggestion engine in an adapter that is compatible with the typeahead jQuery plugin
      name: options.name,
      displayKey: 'value',
      engine: Handlebars, // Specifies the template-rendering engine
      templates: options.templates  // Provides the Handlebars templates to typeahead for the autocomplete heading, suggestion and empty situations
    }).on('typeahead:opened', options.onOpened) // Register events for opening, selecting, and autocompleting search options
      .on('typeahead:selected', options.onSelected)
      .on('typeahead:autocompleted', options.onAutoCompleted);

    console.log('ko.bindingHandlers (' + valueAccessor().name + '): Initialization of search options complete!');
  }
};