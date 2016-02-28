import Randomizer = require('../utils/Randomizer');
import CavePatternGenerator = require('./CavePatternGenerator');
import PatternHelper = require('./PatternHelper');
import types = require('../types');
import Thing = require('../game/Thing');

const WORLD_OBJECT = types.ThingType;
const V2 = BABYLON.Vector2;
const V3 = BABYLON.Vector3;

const DEFAULT_PATTERN_OPTIONS = {
  n: 100,
  m: 100,
  wallChance: .4,
  stepCount: 2,
  nextReal: Math.random,
  // nextReal: Randomizer.generateNextRealFunction(13),
  birthLimit: 4,
  deathLimit: 3,
};

let createdObjectsCount = 0;

class Playground {
  map: number[][];
  boundaries: number[][];
  elevations: Uint8Array;
  startPoints: DistancePoint[];
  wallRects: RectArea[];

  constructor() {
    // initialise cave pattern
    let pattern = CavePatternGenerator.generateCavePattern(DEFAULT_PATTERN_OPTIONS);
    let bypass = PatternHelper.generateBypass(pattern);
    PatternHelper.removeSmallOpenAreas(pattern);

    // boundaries

    // scale 2
    // (dirty way to get rid of unreachable cells)
    // let boundaries = PatternHelper.clone(this.map);
    // let boundaries = PatternHelper.createFilled(n * 2, m * 2, 0);
    // for (let i = 0; i < n; i++) {
    //   for (let j = 0; j < m; j++) {
    //     let value = this.map[i][j];
    //     let i2 = i * 2;
    //     let j2 = j * 2;
    //     boundaries[i2][j2] = value;
    //     boundaries[i2 + 1][j2] = value;
    //     boundaries[i2][j2 + 1] = value;
    //     boundaries[i2 + 1][j2 + 1] = value;
    //   }
    // }

    this.map = PatternHelper.clone(pattern);
    this.wallRects = PatternHelper.calculateRectBlocks(pattern, 1);
    this.boundaries = PatternHelper.clone(pattern);
    this.elevations = PatternHelper.generateElevations(DEFAULT_PATTERN_OPTIONS.n, DEFAULT_PATTERN_OPTIONS.m, DEFAULT_PATTERN_OPTIONS.nextReal);
    this.startPoints = PatternHelper.collectFreeAroundPositions(pattern, bypass);
  }
}

export = Playground;
