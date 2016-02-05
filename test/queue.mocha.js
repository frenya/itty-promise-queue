/*jslint node: true white: true nomen: true */
/*global require, console, describe, it, after, before, Promise */
'use strict';

var assert = require('chai').assert,
    sinon = require('sinon'),
    Queue = require('..');

describe('Queue', function() {
    
    var queue,
        timeout = 500,
        stubSuccess = sinon.stub(),
        stubFailure = sinon.stub();
    
    it('constructor should be a function', function(done) {
        assert.isFunction(Queue);
        done();
    });

    it('should create a valid instance', function(done) {
        queue = new Queue(function (x) {
            return new Promise(function(resolve, reject) {
                setTimeout(function() {
                    if (typeof x === 'number') {
                        resolve(x + 1);
                    }
                    else {
                        reject(new Error('Not a number'));
                    }
                }, timeout);
            });
        });
        
        assert.isFunction(queue.enqueue);
        assert.isFunction(queue._action);
        assert.instanceOf(queue._queue, Promise);
        
        done();
    });

    it('should enqueue objects', function(done) {
        
        // Increase the timeout for this test
        // (must be more than 4 * timeout)
        this.timeout(5 * timeout);
        
        var p1 = queue.enqueue(1),
            p2 = queue.enqueue(2),
            pX = queue.enqueue('X'),    // This one will throw an error
            p3 = queue.enqueue(3);      // but this one should be processed as usual

        // All should be promises
        assert.instanceOf(p1, Promise);
        assert.instanceOf(p2, Promise);
        assert.instanceOf(pX, Promise);
        assert.instanceOf(p3, Promise);
        
        // Attach spies to all
        p1.then(stubSuccess, stubFailure);
        p2.then(stubSuccess, stubFailure);
        pX.then(stubSuccess, stubFailure);
        p3.then(stubSuccess, stubFailure).then(function () {
            
            // Make sure they were called appropriate amount of times
            sinon.assert.callCount(stubSuccess, 3);
            sinon.assert.callCount(stubFailure, 1);
            
            // Make sure they were called with appropriate values respectively
            assert(stubSuccess.getCall(0).calledWithExactly(2));
            assert(stubSuccess.getCall(1).calledWithExactly(3));
            assert(stubSuccess.getCall(2).calledWithExactly(4));

            done();   
        });
        
    });

});