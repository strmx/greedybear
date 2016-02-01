/// <reference path='../../typings/chai.d.ts' />

import Randomizer = require('../utils/Randomizer');
import CaveGenerator = require('../map/CaveGenerator');
import MapHelper = require('../map/MapHelper');

declare var describe: Function, it: Function, beforeEach: Function;
var assert = chai.assert;

const DUMMY_MAP =
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

const BIGGEST_AREA_MAP =
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

const GENERATOR_OPTIONS = {
  n: 32,
  m: 32,
  nextReal: Randomizer.generateNextRealFunction(13),
  birthLimit: 4,
  deathLimit: 3,
};
const CELL_TYPE = CaveGenerator.CELL_TYPE;

describe("CaveGenerator", function() {
  // should be generated once because of seeded randomizer
  let initialMap = MapHelper.createFilledMap(GENERATOR_OPTIONS.n, GENERATOR_OPTIONS.m, CELL_TYPE.ROAD);
  MapHelper.fillMapUniform(initialMap, .4, GENERATOR_OPTIONS.nextReal, CELL_TYPE.WALL);
  for (let i=0; i<2; i++) {
    initialMap = CaveGenerator.generateNextStepCaveMap(initialMap, GENERATOR_OPTIONS.birthLimit, GENERATOR_OPTIONS.deathLimit);
  }
  let map: number[][] = null;

  beforeEach(function() {
    map = MapHelper.cloneMap(initialMap);
  });

  it("generates random cave map (raw)", function() {
    console.log(MapHelper.stringifyMap(map));
    assert.equal(MapHelper.stringifyMap(map), DUMMY_MAP);
  });

  it("finds biggest area", function() {
    CaveGenerator.removeSmallOpenAreas(map);
    console.log(MapHelper.stringifyMap(map));
    assert.equal(MapHelper.stringifyMap(map), BIGGEST_AREA_MAP);
  });



});
