CSSAirportMaps.Config = {};

CSSAirportMaps.Config.typeaheadTemplates = {
  empty: [
    '<div class="empty-message">',
    'Unable to find any Airports that match the search.',
    '</div>'
  ].join('\n'),
  suggestion: Handlebars.compile([
    '<div>',
    '<span class=\'typeahead-airport-name\'>{{name}} - ({{code}})</span>',
    '</div>',
    '<div>{{#isnotnull city}}',
    '<span class=\'typeahead-airport-state\'>{{city}}, {{state}}</span> - <span class=\'typeahead-airport-country\'>{{country}}</span>',
    '{{else}}{{#isnotnull state}}',
    '<span class=\'typeahead-airport-state\'>{{state}}</span> - <span class=\'typeahead-airport-country\'>{{country}}</span>',
    '{{else}}',
    '<span class=\'typeahead-airport-country\'>{{country}}</span>',
    '{{/isnotnull}}{{/isnotnull}}</div>'
  ].join('\n')),
  header: Handlebars.compile('{{#if isEmpty}}{{else}}<h3 class=\'typeahead-dropdown-title\'>Select An Airport</h3>{{/if}}')
};

CSSAirportMaps.Config.bloodhoundOptions = {
  datumTokenizer: function (d) {
    //return Bloodhound.tokenizers.whitespace(d.name);
    // When it's working, try tokenizing multiple fields of the objects
    return arr.concat(Bloodhound.tokenizers.whitespace(d.name), Bloodhound.tokenizers.whitespace(d.city), Bloodhound.tokenizers.whitespace(d.country), Bloodhound.tokenizers.whitespace(d.code), Bloodhound.tokenizers.whitespace(d.state));
  },
  queryTokenizer: Bloodhound.tokenizers.whitespace,
  limit: 40,
  log_successful_searches: true,
  log_failed_searches: true,
  remote: {
    //url: 'http://api.geonames.org/searchJSON?style=full&lang=en&maxRows=20&featureClass=S&featureCode=AIRP&username=cssetian&orderby=relevance&name=%QUERY',
    url: 'http://api.geonames.org/searchJSON?style=full&lang=en&maxRows=20&featureClass=S&featureCode=AIRP&username=cssetian&orderby=relevance&name_startsWith=%QUERY',
    filter: ''
  }
};

CSSAirportMaps.Config.registerHandlebarHelpers = function() {
  Handlebars.registerHelper('isnotnull', function(value, options) {
    var exists = (typeof value !== 'undefined' && value !== null && value.length > 0 && value !== '');
    if( exists ) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
  });
};
