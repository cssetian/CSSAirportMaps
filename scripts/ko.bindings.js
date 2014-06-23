(function() {

  // Typeahead handler
  ko.bindingHandlers.typeahead = {
    init: function (element, valueAccessor, allBindingsAccessor, bindingContext) {
       
        console.log('ko.bindings.init: Search Options: ');
        console.log(MapIt.Config.bloodhound_options());


        // HTML element that the binding was applied to, so DOM operations can be performed
        var $e = $(element);

        // A JavaScript object that you can use to access all the model values bound to this DOM element with the data-bind attribute
        var searchInput = allBindingsAccessor().value;

        // valueAccessor: A JavaScript function that you can call to get the current model property that is involved in this binding.
        // unwrap: This function will extract the observable value if an observable was bound to the value, otherwise will just return the value
        var options = ko.unwrap(valueAccessor());

        console.log('ko.bindings.init: Initializing typeahead custom binding!');
        console.log('ko.bindings.init: element: ');
        console.log($e);
        console.log('ko.bindings.init: valueAccessor() unwrapped');
        console.log(valueAccessor());
        console.log(ko.unwrap(valueAccessor()));
        console.log('ko.bindings.init: allBindingsAccessor');
        console.log(allBindingsAccessor());
        console.log('ko.bindings.init: bindingContext');
        console.log(bindingContext);

        var search_options = MapIt.Config.bloodhound_options();
        search_options.remote.filter = options.remoteFilter;

        console.log('search options');
        console.log(search_options);
        var search = new Bloodhound(search_options);//MapIt.Config.bloodhound_options());

        var searchPromise = search.initialize();
        searchPromise.done(function() { console.log('success!'); })
                     .fail(function() { console.log('err!'); });


        $e.typeahead({
            hint: true, // default = true
            highlight: true,
            /*
            highlighter: function(item) {
                return '<div class="typeahead-suggestion-match">' + item + '</div>';
            }, */ // default = false
            //autoselect: true,
            minLength: 1, // default = 1
            limit: 2,
          }, {
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

  Handlebars.registerHelper('isnotnull', function(value, options) {
    var exists = (typeof value !== 'undefined' && value !== null && value.length > 0 && value !== '');

    if( exists ) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
  });

})();