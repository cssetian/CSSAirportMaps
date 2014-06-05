var ExampleViewModel = function () {
    var self = this;

    self.jsFrameworks = ko.observableArray([
        'Angular',
        'Canjs',
        'Batman',
        'Meteor',
        'Ember',
        'Backbone',
        'Knockout',
        'Knockback',
        'Spine',
        'Sammy',
        'YUI',
        'Closure',
        'jQuery']);

    self.frameworkToAdd = ko.observable("");
    self.addFramework = function () {
        self.jsFrameworks.push(self.frameworkToAdd());
    };

    self.removeFramework = function (framework) {
        self.jsFrameworks.remove(framework);
    };
};

$(function () {
    var viewModel = new ExampleViewModel();

    ko.bindingHandlers.typeahead = {
        init: function (element, valueAccessor, bindingAccessor) {
            var substringMatcher = function (strs) {
                return function findMatches(q, cb) {
                    var matches, substringRegex;

                    // an array that will be populated with substring matches
                    matches = [];

                    // regex used to determine if a string contains the substring `q`
                    substrRegex = new RegExp(q, 'i');

                    // iterate through the pool of strings and for any string that
                    // contains the substring `q`, add it to the `matches` array
                    $.each(strs, function (i, str) {
                        // console.log(str);
                        if (substrRegex.test(str)) {
                            // the typeahead jQuery plugin expects suggestions to a
                            // JavaScript object, refer to typeahead docs for more info
                            matches.push({
                                value: str
                            });
                        }
                    });

                    cb(matches);
                };
            };
            var $e = $(element),
                options = valueAccessor();

            console.dir(options.source());

            console.dir($e);

            // passing in `null` for the `options` arguments will result in the default
            // options being used
            $e.typeahead({
                highlight: true,
                minLength: 2
            }, {
                source: substringMatcher(options.source())
            }).on('typeahead:selected', function (el, datum) {
                console.dir(datum);
            }).on('typeahead:autocompleted', function (el, datum) {
                console.dir(datum);
            });

        }
    };

    ko.applyBindings(viewModel);
});