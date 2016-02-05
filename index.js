/*jslint node: true white: true nomen: true */
/*global require, console, Promise */
'use strict';

// Constructor
//
// @param {Function} action
// A synchronous(!) function accepting a single argument and returning either a value or a Promise
//
// Example action (for any x returns a promise that gets resolved to x+1 after 2 seconds):
//
//  function(x) {
//      return new Promise(function(resolve, reject) {
//          setTimeout(function() {
//              if (typeof x === 'number') resolve(x+1);
//              else reject(new Error('Not a number'));
//          }, 2000);
//      });
//  }
function Queue(action) {
    
    // Promise representing the queue's tail
    this._queue = Promise.resolve();
    this._action = action;
    
}

// Main public method
//
// @param {Any} x Value that will be passed to the action function
// @return Promise that will be resolved by the action's return value
//
// Typically, this is an interim Promise that gets first resolved with
// another Promise when the action is called and ultimately by
// the resolution value after the asynchronous operation has completed.
Queue.prototype.enqueue = function (x) {
    
    // Store action so that we can call it inside then()
    var action = this._action;
    
    // Append a call to the action function
    // with the given parameter to the end of queue
    var result = this._queue.then(function() {
        return action(x);
    });

    // Move the queue's tail
    // Show must go on, so catch and ignore all errors
    this._queue = result.catch(function(err) {});

    // Return the original promise back to caller
    // NOTE: This is the promise before the catch
    //       so errors will still be reported.
    return result;
    
}

module.exports = Queue;