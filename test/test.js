'use strict';
var expect = require('chai').expect;
var index = require('../dist/index.js');

describe('main module test', () => {
    it('should add exclamation', () => {
        var result = index.test('Hello');
        expect(result).to.equal('Hello!');
    });
});