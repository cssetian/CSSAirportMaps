MapIt.Airport = function(map, options) {
  console.log('MapIt.Airport: Initializing Airport ViewModel for ' + options.name);
  var self = this;

  self.id = options.id;
  self.name = options.name;

  // DO I WANT TO MAINTAIN THESE STATE VARIABLES ON THE ACTUAL AIRPORTS?
  self.isSelected = ko.observable(false);
  self.isSearchActive = ko.observable(false);
  
  self.airportData = ko.observable(options.airportData);
  self.airportCoords = ko.computed({
    read: function() {
      return new google.maps.LatLng(parseFloat(self.airportData().lat, 10), parseFloat(self.airportData().lng, 10));
    },
    owner: self
  });
  self.airportMarker = ko.computed({
    read: function() {
      return new google.maps.Marker({map: map, position: self.airportCoords(), title: self.name + ': Blah'});
    },
    owner: self
  });

  // THESE EVENT HANDLERS ARE NOT CURRENTLY IN USE - CURRENTLY DEFINED ON THE VIEWMODEL - NOT SURE IF THEY SHOULD BE HERE OR THERE - THESE DON'T WORK THOUGH WITH CURRENT CODE
  // https://github.com/twitter/typeahead.js/issues/300
  self.onSelectedAndAutocompleted = function(obj, datum, name) {
    //Fires when you select one of the options in the autocomplete either with the mouse or using the arrow keys and tab/enter
    console.log('Airport.<' + self.name + '>.onSelectedAndAutocompleted: SELECTED DATA W MOUSE OR TAB/ENTER- SELECTED RESULT SHOULD UPDATE AUTOMATICALLY --v');
    console.log(datum);
    if(self.bloodhoundSearchResultSet().length > 0) {
      self.isSelected(true);
    } else {
      console.log('no bloodhound search results to select!');
    }
    //self.selectedSearchResultObj(datum);  // Assign the selected result object that will be used for rendering when an option of the autocomplete is selected

    //console.log(JSON.stringify(obj)); // object
    // outputs, e.g., {"type":"typeahead:selected","timeStamp":1371822938628,"jQuery19105037956037711017":true,"isTrigger":true,"namespace":"","namespace_re":null,"target":{"jQuery19105037956037711017":46},"delegateTarget":{"jQuery19105037956037711017":46},"currentTarget":
    console.log(JSON.stringify(datum)); // contains datum value, tokens and custom fields
    // outputs, e.g., {"redirect_url":"http://localhost/test/topic/test_topic","image_url":"http://localhost/test/upload/images/t_FWnYhhqd.jpg","description":"A test description","value":"A test value","tokens":["A","test","value"]}
    // in this case I created custom fields called 'redirect_url', 'image_url', 'description'   
    console.log(JSON.stringify(name)); // contains dataset name
    // outputs, e.g., "my_dataset"
    console.log('Airport.<' + self.name + '>.onSelected: END OF onSELECTED EVENT HANDLER AND LOGGING');
  };

  self.registerEnterKeyAutocomplete = function (typeAheadEl) {
    typeAheadEl.on('keydown', function(event) {
      // Define tab key
      var e = $.Event('keydown');
      e.keyCode = e.which = 9; // 9 == tab
      
      if (event.which === 13) {  // if user is pressing enter key
        typeAheadEl.trigger(e); // trigger "tab" key - which works as "enter" for typeahead
      }
      typeAheadEl.typeahead('close');  // Closes the typeahead when tab or enter selects an item
    });
  };

};

