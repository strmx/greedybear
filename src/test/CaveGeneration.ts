/// <reference path='../../typings/chai.d.ts' />

import Randomizer = require('../utils/Randomizer');
import CaveGenerator = require('../map/CaveGenerator');
import MapHelper = require('../map/MapHelper');

declare var describe: Function, it: Function;
var assert = chai.assert;

const DUMMY_MAP =
`███████████████████████████░░░██
░░░███░███████████████░░░░░░░░██
░░░██░░████████░░███░░░░░░░░░░██
░░░░░░░██████░░░░░██░░░░██░░░░██
█░░░░░░██████░░░░░░░░░░████░░███
██░░░░░████████░░░░░░░░░████░███
██░░░░░░░█████████░░░░░█████████
██░░░░░░░██░░░░███░░░███████████
██░░░░░░█░░░░░░░███░████████████
█░░░░░░██░░░░░█░░███░░░████░░███
█░░░░░███░░░░███░██░░░░███░░░░██
█░░░░██░░░░░░████░░░░░████░░░░░█
██░░░█░░░░░░░░░░░░░░█████░░░░░░█
███░██░░░░░░░░░░░░░░██░░░░░░░░░░
█░░███░░░░░░░░░░░░░░░░░░░░░░░░░░
░░░░██░░░░░░░░░░░░░░░░██░░░░░░░░
░░░░░░░░░░░███░░░░░░░░███░░░██░░
░░░░░░░░░░█████░░░░░░░████░░██░░
░░░░░░░░░░████████░░░░██░░░░░░░█
░░░░░░░░░░████████░░░░░░░░░░░░██
░░░░░░░░░░█░░████░░░░░░░░░░░░███
░░░░░░░░░██░░████░░░█░░░░░░░████
█░░░░░░░░██░░░████████░░░░░░████
░░░░░░░░░██░░░░███████░░░░░█████
░░░░░░░░░░░░░░░░░░░██░░░░░██████
░░░░░░░░░░░░░░░░██░░░░░░████████
█░░░░░░░░░██░░░███░░░░░░████████
█░░░░░░░░██████████░░░░░░███████
█░░░░░░░███████████░░░░░░███████
██░░░░░░█████░░░███░░░░░████████
██░░░██░░████░░░███░░░░░████████
███░████░███████████░░░█████████`;

const GENERATOR_OPTIONS = {
  n: 32,
  m: 32,
  nextReal: Randomizer.generateNextRealFunction(13),
  birthLimit: 4,
  deathLimit: 3,
};
const CELL_TYPE = CaveGenerator.CELL_TYPE;

describe("CaveGenerator", function() {
  it("generates random cave map (raw)", function() {
    let map = MapHelper.createFilledMap(GENERATOR_OPTIONS.n, GENERATOR_OPTIONS.m, CELL_TYPE.ROAD);
    MapHelper.fillMapUniform(map, .4, GENERATOR_OPTIONS.nextReal, CELL_TYPE.WALL);
    for (let i=0; i<2; i++) {
      map = CaveGenerator.generateNextStepCaveMap(map, GENERATOR_OPTIONS.birthLimit, GENERATOR_OPTIONS.deathLimit);
    }
    assert.equal(MapHelper.mapToString(map), DUMMY_MAP);
  });
});
