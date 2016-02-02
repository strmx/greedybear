/// <reference path='../../typings/chai.d.ts' />

import Randomizer = require('../utils/Randomizer');
import CavePatternGenerator = require('../map/CavePatternGenerator');
import PatternHelper = require('../map/PatternHelper');

declare var describe: Function, it: Function, beforeEach: Function;
var assert = chai.assert;

describe("PatternHelper", function() {

  const GENERATOR_OPTIONS = {
    n: 32,
    m: 32,
    wallChance: .4,
    stepCount: 2,
    nextReal: Randomizer.generateNextRealFunction(13),
    birthLimit: 4,
    deathLimit: 3,
  };
  const CELL_TYPE = CavePatternGenerator.CELL_TYPE;

  // test pattern
  // test pattern should be generated once because of seeded randomizer
  let initialPattern = PatternHelper.createFilled(GENERATOR_OPTIONS.n, GENERATOR_OPTIONS.m, CELL_TYPE.ROAD);
  PatternHelper.fillUniform(initialPattern, .4, GENERATOR_OPTIONS.nextReal, CELL_TYPE.WALL);
  for (let i=0; i<2; i++) {
    initialPattern = CavePatternGenerator.applyCAStep(initialPattern, GENERATOR_OPTIONS.birthLimit, GENERATOR_OPTIONS.deathLimit);
  }
  let pattern: number[][] = null;

  beforeEach(function() {
    pattern = PatternHelper.clone(initialPattern);
  });

  it("clones", function() {
    let dummyPattern = [[0,0,0],[1,2,3], [4,5,6], [1,2,1]];
    let clonePattern = PatternHelper.clone(dummyPattern);
    assert.deepEqual(dummyPattern, clonePattern, 'pattern are equal');
    assert.notEqual(dummyPattern[0], clonePattern[0], 'arrays are different objects');
  });

  it("stringify and parse", function() {
    let dummyPattern = [[0,0,0],[1,2,3], [4,5,6], [1,2,1]];
    let patternText = PatternHelper.stringify(dummyPattern);
    let parsedPattern = PatternHelper.parse(PatternHelper.stringify(dummyPattern));
    assert.deepEqual(dummyPattern, parsedPattern, 'pattern are equal');
    assert.notEqual(dummyPattern[0], parsedPattern[0], 'arrays are different objects');
  });

  const DUMMY_PATTERN =
`█░░░███████████░░░░░░░█░░░██████
█░░░░████░░░██░░░░░░░░░░░░░░░███
█░░░░░░░░░░░░█░░░░░░░░░░░░░░░░░█
███░░░░░░░░░░░█░░░░░░░░░░░░░░░░░
███░░░░░░░░░░███░░░░░░░░░░░░░░░█
██░░░░░░░░░█████░░░░░░░░░░░░░░██
█░░░░░░░░░██░░░░░░░░░░░░░░░░░░██
██████░░░██░░░░░░░░░░░░░░░░░░░░█
██████░░███░░░░░░░░░░░░░░░░░██░░
████████░░░░░░░░░░░░░███░░░█████
████████░░░░░░░░░███████░░██████
███████░░░░░░░░░████░░░░░░██████
███████░░░░░░░░░████░░░░░░░█████
███░░██░░░██░░░░██████░░░░░██░░█
███░░██░░███░░░░░██████░░░░██░░█
██░░░░██░░██░░░░░░██████░░███░░█
██░░░░███░░█░░░░░░██████░███████
███░░░█████░░░░░░░██░░██░███████
████░░░░███░░░░░░░░░░░██░░░█████
████░░░░░█░░░░░░░░░░░░███░░░░░░█
██░░░░░░█░░░██░░░░░░░████░░░░░░░
██░░░░░██░░░██░░░░░░░░██░░░░░░░░
█░░░░░░██░░██░░████░░░░░░░░░░░░░
█░░░█░███████░░████░░░░░░░░░░░░█
█░░██████████░░░██░░░░░░░██░░███
█░░█████████░░░░░█░░░░░░░███████
█░░░██████░░░░░░░░░░░░░░████████
░░░░░████░░░░░░░░░░░░░░█████████
░░░░░░███░░░░░░░██░░░███████████
░░░░██████░░░░░░██░░████████████
███████████░░░░░░░░█████████████
█████████████░░░░░██████████████`;

  it("generates random cave pattern (raw)", function() {
    console.log(PatternHelper.stringify(pattern));
    assert.equal(PatternHelper.stringify(pattern), DUMMY_PATTERN);
  });

  const BIGGEST_AREA_PATTERN =
`███████████████░░░░░░░█░░░██████
██████████████░░░░░░░░░░░░░░░███
██████████████░░░░░░░░░░░░░░░░░█
███████████████░░░░░░░░░░░░░░░░░
████████████████░░░░░░░░░░░░░░░█
████████████████░░░░░░░░░░░░░░██
████████████░░░░░░░░░░░░░░░░░░██
███████████░░░░░░░░░░░░░░░░░░░░█
███████████░░░░░░░░░░░░░░░░░██░░
████████░░░░░░░░░░░░░███░░░█████
████████░░░░░░░░░███████░░██████
███████░░░░░░░░░████░░░░░░██████
███████░░░░░░░░░████░░░░░░░█████
███████░░░██░░░░██████░░░░░█████
███████░░███░░░░░██████░░░░█████
████████░░██░░░░░░██████░░██████
█████████░░█░░░░░░██████░███████
███████████░░░░░░░██░░██░███████
███████████░░░░░░░░░░░██░░░█████
██████████░░░░░░░░░░░░███░░░░░░█
█████████░░░██░░░░░░░████░░░░░░░
█████████░░░██░░░░░░░░██░░░░░░░░
█████████░░██░░████░░░░░░░░░░░░░
█████████████░░████░░░░░░░░░░░░█
█████████████░░░██░░░░░░░██░░███
████████████░░░░░█░░░░░░░███████
██████████░░░░░░░░░░░░░░████████
█████████░░░░░░░░░░░░░░█████████
█████████░░░░░░░██░░░███████████
██████████░░░░░░██░░████████████
███████████░░░░░░░░█████████████
█████████████░░░░░██████████████`;

  it("finds biggest area", function() {
    PatternHelper.removeSmallOpenAreas(pattern);
    console.log(PatternHelper.stringify(pattern));
    assert.equal(PatternHelper.stringify(pattern), BIGGEST_AREA_PATTERN);
  });

  /*
  ███████████████░░░░░░░█░░░██████
  ██████████████░1░░░░░░░░░░░░░███
  ██████████████░░░░░░░░░░░░░░░░░█
  ███████████████░░░░4░░░░░░░░░2░░
  ████████████████░░░░░░░░4░░░░░░█
  ████████████████░░░░░░░░░░░░░░██
  ████████████░░░░░░░░░░░░░░░░2░██
  ███████████░1░2░░3░░░░░░░░░░░░░█
  ███████████░░░░░░░░░1░░░░░1░██░░
  ████████░░░░░░░░░░░░░███░1░█████
  ████████░░░░░3░░░███████░░██████
  ███████░░2░░░░░░████░░░░░░██████
  ███████░░░░░░░░░████░░░░2░░█████
  ███████░1░██░░2░██████░░░░░█████
  ███████░░███░░░░░██████░░1░█████
  ████████░░██░░░░░░██████░░██████
  █████████░░█░░░░░░██████░███████
  ███████████░░░3░░░██░░██░███████
  ███████████░░░░░░░░░1░██░░░█████
  ██████████░1░░░░░2░░░░███░░░░░░█
  █████████░1░██░2░░░2░████░░░░░░░
  █████████░░░██░░░░░░░░██░░░░3░░░
  █████████░░██░░████░░░░░░2░░░░░░
  █████████████░░████░░░░░░░░░░░░█
  █████████████░░░██░░░3░░░██░░███
  ████████████░░2░░█░░░░░░░███████
  ██████████░░░░░░1░░░░░░░████████
  █████████░1░░░░░░░░2░░░█████████
  █████████░░░░3░░██░░░███████████
  ██████████░░░░░░██░░████████████
  ███████████░░░░░░░░█████████████
  █████████████░░░░░██████████████*/

  const START_POINTS = [{
    "x": 24,
    "y": 4,
    "distance": 4.47213595499958
  }, {
    "x": 19,
    "y": 3,
    "distance": 4.242640687119285
  }, {
    "x": 21,
    "y": 24,
    "distance": 3.1622776601683795
  }, {
    "x": 14,
    "y": 17,
    "distance": 3.1622776601683795
  }, {
    "x": 13,
    "y": 10,
    "distance": 3.1622776601683795
  }, {
    "x": 28,
    "y": 21,
    "distance": 3
  }, {
    "x": 13,
    "y": 28,
    "distance": 3
  }, {
    "x": 17,
    "y": 7,
    "distance": 2.8284271247461903
  }, {
    "x": 19,
    "y": 27,
    "distance": 2.23606797749979
  }, {
    "x": 14,
    "y": 25,
    "distance": 2.23606797749979
  }, {
    "x": 17,
    "y": 19,
    "distance": 2.23606797749979
  }, {
    "x": 24,
    "y": 12,
    "distance": 2.23606797749979
  }, {
    "x": 9,
    "y": 11,
    "distance": 2.23606797749979
  }, {
    "x": 14,
    "y": 13,
    "distance": 2
  }, {
    "x": 14,
    "y": 7,
    "distance": 2
  }, {
    "x": 19,
    "y": 20,
    "distance": 2
  }, {
    "x": 15,
    "y": 20,
    "distance": 2
  }, {
    "x": 25,
    "y": 22,
    "distance": 2
  }, {
    "x": 28,
    "y": 6,
    "distance": 2
  }, {
    "x": 29,
    "y": 3,
    "distance": 2
  }, {
    "x": 20,
    "y": 8,
    "distance": 1.4142135623730951
  }, {
    "x": 20,
    "y": 18,
    "distance": 1.4142135623730951
  }, {
    "x": 11,
    "y": 19,
    "distance": 1.4142135623730951
  }, {
    "x": 25,
    "y": 9,
    "distance": 1.4142135623730951
  }, {
    "x": 25,
    "y": 14,
    "distance": 1.4142135623730951
  }, {
    "x": 8,
    "y": 13,
    "distance": 1.4142135623730951
  }, {
    "x": 26,
    "y": 8,
    "distance": 1.4142135623730951
  }, {
    "x": 10,
    "y": 20,
    "distance": 1.4142135623730951
  }, {
    "x": 12,
    "y": 7,
    "distance": 1.4142135623730951
  }, {
    "x": 15,
    "y": 1,
    "distance": 1.4142135623730951
  }, {
    "x": 16,
    "y": 26,
    "distance": 1.4142135623730951
  }, {
    "x": 10,
    "y": 27,
    "distance": 1.4142135623730951
  }];

  it("generate start points", function() {
    PatternHelper.removeSmallOpenAreas(pattern);
    let positions = PatternHelper.collectFreeAroundPositions(pattern, 0);
    assert.deepEqual(positions, START_POINTS);
  });

});
