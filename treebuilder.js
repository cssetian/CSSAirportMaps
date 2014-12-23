// This will eventually fail for large input because it will overflow the stack because recursive functions will just keep piling up
// Should implement some form of dynamic programming

var input = [
    ['a'],
    ['g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w', 'w','g', 'w', 'f', 'w', 'w','g', 'w', 'f', 'w', 'w','g', 'w', 'f', 'w', 'w','g', 'w', 'f', 'w', 'w','g', 'w', 'f', 'w', 'w','g', 'w', 'f', 'w', 'w','g', 'w', 'f', 'w', 'w','g', 'w', 'f', 'w', 'w','g', 'w', 'f', 'w', 'w','g', 'w', 'f', 'w', 'w','g', 'w', 'f', 'w', 'w','g', 'w', 'f', 'w', 'w','g', 'w', 'f', 'w', 'w','g', 'w', 'f', 'w', 'w','g', 'w', 'f', 'w', 'w','g', 'w', 'f', 'w', 'w','g', 'w', 'f', 'w', 'w','g', 'w', 'f', 'w', 'w','g', 'w', 'f', 'w', 'w','g', 'w', 'f', 'w', 'w','g', 'w', 'f', 'w', 'w','g', 'w', 'f', 'w', 'w','g', 'w', 'f', 'w', 'w','g', 'w', 'f', 'w', 'w','g', 'w', 'f', 'w', 'w','g', 'w', 'f', 'w', 'w','g', 'w', 'f', 'w', 'w','g', 'w', 'f', 'w', 'w','g', 'w', 'f', 'w', 'w','g', 'w', 'f', 'w', 'w','g', 'w', 'f', 'w', 'w','g', 'w', 'f', 'w', 'w','g', 'w', 'f', 'w', 'w','g', 'w', 'f', 'w', 'w','g', 'w', 'f', 'w', 'w','g', 'w', 'f', 'w', 'w','g', 'w', 'f', 'w', 'w','g', 'w', 'f', 'w', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','l']
    ,['g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','l']
    ,['g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','l']
    ,['g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','l']
    ,['g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','g', 'w', 'f', 'w','l']
    ,['g', 'd', 'f', 'w']
    ,['g', 's', 'f', 't']
    ,['g', 's', 'j', 'w']
    ,['g', 'y', 'f', 'w']
    ,['g', 'e', 'f', 'w']
    ,['g', 's', 'f', 't']
    ,['g', 's', 'f', 't']
    ,['g', 's', 'f', 't']
    ];
var output = {};

console.log('Initial Source Input Array of Arrays --v');
console.log(input);
console.log('Initial Output Object --v');
console.log(output);


// http://stackoverflow.com/questions/11514308/big-o-of-javascript-arrays
// Source = Seed object to apply new input arrays to
// Input = Array of characters, specifying the tree path at which to increment a node
// Idx = Index of the input at which to pluck the name of the next node from, necessary because of recursion
var myprocesser = function(source, input, idx) {
    // Remove the first element of the input for testing
    var prop = input[idx];
    idx ++;
    
    //console.log('selected element \'' + prop + '\' from the input at position ' + idx + ' at index ' + (idx-1));
    
    // This is the case in which we have popped the last element off the input array
    // Base case - Once you reach here you create/increment node in source and return
    if(idx === input.length) {
        //console.log('Reached the end of our dive into the tree! Incrementing value and returning object');
        
        if(typeof source[prop] === 'undefined' || source[prop] === null) {
            source[prop] = 1;
            return source;
        } else if(typeof source[prop] === 'number') {
             source[prop] += 1;   
            return source;
        } else if(typeof source[prop] === 'object') {
            console.log('ERROR! Source has a node at this location, but input was anticipating a leaf!');
            console.log('prop: ' + prop);
            console.log('current source: ---v');
            console.log(source);
            console.log('This should never be the case, because either input should be constrained so that there aren\'t collisions of nodes and numbers at the same level and character, or the tree should be able to store both. not sure');   
            return false;
        }        
        
    } else if( idx < input.length) {
        // If the property doesn't exist in the source, need to create it
        //console.log('We\'re not at the end of the input array yet. Keep diving until we reach a leaf');
        
        if(typeof source[prop] === 'undefined') {
            //console.log('property ' + prop + ' doesn\'t exist at this location! Creating new node at this property.');
            source[prop] = {};   
        }
        
        // Since we know there are more nodes,
        //        set this property equal to the recrusive function 
        //        output with the index incremented
        // console.log('Calling self recursively with index incremented to ' + (idx + 1));
        source[prop] = myprocesser(source[prop], input, idx++);
        
        return source;
    } else {
        // Should really never reach here... 
        console.log('This code should never be reached...');
        
        return false;
    }
    
    console.log('This code should never be reached...at end of method');
    return false;    
};

var tempOut = {};
var start = new Date().getTime();
for(var i = 0; i < input.length; i++) {
    console.log('Executing iteration ' + (i+1) + ' of input processing!');
    var tempstart = new Date().getTime();
    tempOut = myprocesser(tempOut, input[i], 0);
    console.log('Completed execution of input processing iteration ' + (i + 1) + ': 1st=input, 2nd=output');
    console.log(input[i]);
    console.log(tempOut);
    var tempend = new Date().getTime();
var temptime = tempend - tempstart;
console.log('Execution time of iteration ' + (i+1) + ': ' + temptime + 'ms');
    console.log('----------------------------------------------');
}
var end = new Date().getTime();
var time = end - start;
console.log('Final execution time: ' + time + 'ms');
output = tempOut;
console.log('Final Output! - ');
console.log(output);
