[![Build Status](https://travis-ci.org/frenya/itty-promise-queue.svg?branch=master)](https://travis-ci.org/frenya/itty-promise-queue)

Promise based implementation of a processing queue. Can be used for queueing any kind of
asynchronous operations that should be performed one at a time (e.g. sending request to a REST API).

# Usage

Define function that will be processing queued objects. This should be a **synchronous**
function accepting any number of argument and returning either a value or a Promise.

```javascript
// Example action
// (for any x returns a promise that resolves to x+1 after 2 seconds)
function myAction(x) {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            if (typeof x === 'number') resolve(x+1);
            else reject(new Error('Not a number'));
        }, 2000);
    });
}
```

Create a queue with the given processing action and start processing objects.

```javascript
var queue = new Queue(myAction);
var p1 = queue.enqueue(1),		// myAction(1) gets called immediately
    p2 = queue.enqueue(2),		// myAction(2) will get called once p1 resolves or rejects
    p3 = queue.enqueue(3);		// myAction(3) will get called once p2 resolves or rejects

p1.then(function (y) {
	console.log(y);				// Will write 2 to the console after 2 seconds
}).catch(function (err) {
	console.error(err);
});
```    
