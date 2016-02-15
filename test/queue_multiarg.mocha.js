/*jslint node: true white: true nomen: true */
/*global require, console, describe, it, after, before, Promise */
'use strict';

var assert = require('chai').assert,
    sinon = require('sinon'),
    Queue = require('..');

describe('Multi-argument action', function() {
    
    var queue,
        timeout = 500,
        stubSuccess = sinon.stub(),
        stubFailure = sinon.stub();
    
    it('constructor should be a function', function(done) {
        assert.isFunction(Queue);
        done();
    });

    it('should create a valid instance', function(done) {
        queue = new Queue(function () {
            var args = arguments;
            return new Promise(function(resolve, reject) {
                setTimeout(function() {
                    resolve(Array.prototype.join.call(args, ''));
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
        
        var p1 = queue.enqueue(1, 2, 3),
            p2 = queue.enqueue('B', 'a', 'z', 'i', 'n', 'g', 'a');

        // All should be promises
        assert.instanceOf(p1, Promise);
        assert.instanceOf(p2, Promise);
        
        // Attach spies to all
        p1.then(stubSuccess, stubFailure);
        p2.then(stubSuccess, stubFailure).then(function () {
            
            // Make sure they were called appropriate amount of times
            sinon.assert.callCount(stubSuccess, 2);
            sinon.assert.callCount(stubFailure, 0);
            
            // Make sure they were called with appropriate values respectively
            assert(stubSuccess.getCall(0).calledWithExactly('123'));
            assert(stubSuccess.getCall(1).calledWithExactly('Bazinga'));

            done();   
        });
        
    });

});

// An extra test for bound functions
//
// Since we are calling the action using `action.apply(null, arguments)
// this unit test makes sure that `this` inside the action still
// corresponds to the correct (bound) object.
describe('Multi-argument bound action', function() {

    var queue,
        timeout = 500,
        stubSuccess = sinon.stub(),
        stubFailure = sinon.stub();
    
    var scapegoat = { name: 'Here '};
    function myAction () {
        return this.name + Array.prototype.join.call(arguments, '');
    }

    it('should create a valid instance', function(done) {
        var boundAction = myAction.bind(scapegoat, 'comes ');
        
        queue = new Queue(boundAction);

        assert.isFunction(queue.enqueue);
        assert.isFunction(queue._action);
        assert.instanceOf(queue._queue, Promise);

        done();
    });

    it('should enqueue objects', function(done) {

        // Increase the timeout for this test
        // (must be more than 4 * timeout)
        this.timeout(5 * timeout);

        var p1 = queue.enqueue(1, 2, 3),
            p2 = queue.enqueue('B', 'a', 'z', 'i', 'n', 'g', 'a');

        // All should be promises
        assert.instanceOf(p1, Promise);
        assert.instanceOf(p2, Promise);

        // Attach spies to all
        p1.then(stubSuccess, stubFailure);
        p2.then(stubSuccess, stubFailure).then(function () {

            // Make sure they were called appropriate amount of times
            sinon.assert.callCount(stubSuccess, 2);
            sinon.assert.callCount(stubFailure, 0);
            
            // Make sure they were called with appropriate values respectively
            assert(stubSuccess.getCall(0).calledWithExactly('Here comes 123'));
            assert(stubSuccess.getCall(1).calledWithExactly('Here comes Bazinga'));

            done();   
        });

    });

});