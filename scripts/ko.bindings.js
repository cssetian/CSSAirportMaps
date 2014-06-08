(function() {

  ko.lazyObservable = function(callback, target) {
    var _internalValue = ko.observable();
    console.log('Defining lazyObservable!');
    console.log('lazyObservable ' + target.name + ' result.read: CALLBACK Function ----v - not logging read value');
    //console.log(callback); // This returns the string representation of the callback function. Takes up a lot of logging space
    console.log('lazyObservable ' + target.name + ' result.read: TARGET Object -------v');
    console.log(target);

    var result = ko.computed({
      read: function() {
        console.log('lazyObservable.' + target.name + '.result.read: Executing read() function of lazyObservable!');
        // If the observable isn't loaded yet, call this function to handle the lack of data
        if(!result.loaded()) {
          console.log('lazyObservable.' + target.name + '.result.read: observable not loaded! Calling callback function, and passing target');
          callback.call(target);
        } else {
          console.log('lazyObservable.' + target.name + '.result.read: observable is already loaded. Not calling callback function. This logic block is only for logging.');
        }
        console.log('lazyObservable.' + target.name + '.result.read: Back to result.read after calling the callback method');
        console.log('lazyObservable.' + target.name + '.result.read: returning internal observable value! read value -----v - not logging read value');
        console.log(_internalValue()); // This returns the string representation of the callback function. Takes up some unnecessary logging space
        return _internalValue();
      },
      write: function(newValue) {
        console.log('lazyObservable.' + target.name + '.result.write: Executing write() function of observable! New value ----v ');
        console.log(newValue);
        result.loaded(true);
        _internalValue(newValue);
      },
      deferEvaluation: true
    });
    
    //expose the current state, which can be bound against
    result.loaded = ko.observable();
      
    //sets the loaded flag to false, which causes the dependentObservable to be re-evaluated.
    result.refresh = function() {
      console.log('lazyObservable ' + target.name + '.result.refresh: Calling refresh function!');
      result.loaded(false);
    };
      
    return result;
  };

  ko.extenders.lazy = function(target, options) {
    console.log('ko.extenders.lazy: Setting up lazy observable!');
    var result = ko.computed({
        read: function() {
            console.log('ko.extenders.lazy: Reading the lazy observable extenderSearchResults');
            if (!result.loaded() && options.callback) {
                console.log('ko.extenders.lazy: Result is not loaded, executing callback function!');
                options.callback.call(target);
            }
            console.log('ko.extenders.lazy: calling target!');
            return target();
        },
        write: function(newValue) {
            console.log('ko.extenders.lazy: Writing the lazy observable extenderSearchResults');
            result.loaded(true);
            target(newValue);
        },
 
        deferEvaluation: true
    });
 
    result.loaded = ko.observable();
 
    result.refresh = function() {
        console.log('ko.extenders.lazy: refreshing result');
        result.loaded(false);
    };
    
    console.log('ko.extenders.lazy: returning result');
    return result;
};

})();