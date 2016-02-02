/// <reference path='../../typings/chai.d.ts' />

import Randomizer = require('../utils/Randomizer');
import CaveGenerator = require('../map/CaveGenerator');
import PatternHelper = require('../map/PatternHelper');

declare var describe: Function, it: Function, beforeEach: Function;
var assert = chai.assert;


describe("MapHelper", function() {
  let map = null;

  beforeEach(function() {
    map = [[0,0,0],[1,2,3], [4,5,6], [1,2,1]];
  });

  it("clones", function() {
    let cloneMap = PatternHelper.cloneMap(map);
    assert.deepEqual(map, cloneMap, 'maps are equal');
    assert.notEqual(map[0], cloneMap[0], 'arrays are different objects');
  });

  it("stringify and parse", function() {
    let mapText = PatternHelper.stringifyMap(map);
    let parsedMap = PatternHelper.parseMap(PatternHelper.stringifyMap(map));
    assert.deepEqual(map, parsedMap, 'maps are equal');
    assert.notEqual(map[0], parsedMap[0], 'arrays are different objects');
  });
});
