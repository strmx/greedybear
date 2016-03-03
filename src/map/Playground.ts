/// <reference path="../../typings/Interfaces.d.ts" />

import Randomizer = require('../utils/Randomizer');
import CavePatternGenerator = require('./CavePatternGenerator');
import PatternHelper = require('./PatternHelper');
import Elevation = require('./Elevation');
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
  // nextReal: Math.random,
  nextReal: Randomizer.generateNextRealFunction(13),
  birthLimit: 4,
  deathLimit: 3,
  maxHeight: 100
};

class Playground {
  map: number[][]
  boundaries: number[][]
  heightMap: number[][]
  maxHeight: number
  elevationMap: Elevation[][]
  map3d: Map3DCell[][]
  startPoints: DistancePoint[]
  wallRects: RectArea[]

  constructor() {
    let spec = DEFAULT_PATTERN_OPTIONS;

    // initialise cave pattern
    let pattern = CavePatternGenerator.generateCavePattern(spec);
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

    this.maxHeight = spec.maxHeight;
    this.map = PatternHelper.clone(pattern);
    this.wallRects = PatternHelper.calculateRectBlocks(pattern, 1);
    this.boundaries = PatternHelper.clone(pattern);
    this.startPoints = PatternHelper.collectFreeAroundPositions(pattern, bypass);
    this.heightMap = PatternHelper.generateElevations(spec.n, spec.m, spec.nextReal);
    this.elevationMap = this._generateElevations(this.heightMap, this.maxHeight, spec);
    this.map3d = this._generate3DMap(this.heightMap);
  }

  /*
interface Map3DCell {
  pos: BABYLON.Vector3;
  directionTop: BABYLON.Vector3;
  directionRight: BABYLON.Vector3;
  directionBottom: BABYLON.Vector3;
  directionLeft: BABYLON.Vector3;
}
  */
  private _generate3DMap(heightMap: number[][]): Map3DCell[][] {
    let n = heightMap.length;
    let m = heightMap[0].length;
    let map3d: Map3DCell[][] = [];

    for (let i = 0; i < n; i++) {
      let row = [];
      for (let j = 0; j < m; j++) {
        let pos = new BABYLON.Vector3(i, heightMap[i][j], j);
        row.push({
          pos,
          directionTop: pos,
          directionRight: pos,
          directionBottom: pos,
          directionLeft: pos,
        });
      }
      map3d.push(row);
    }

    // calculate directions
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        let cell3d = map3d[i][j];
        // top
        if (j > 0) {
          cell3d.directionTop = map3d[i][j - 1].pos.subtract(cell3d.pos);
        }
        // right
        if (i < n - 1) {
          cell3d.directionRight = map3d[i + 1][j].pos.subtract(cell3d.pos);
        }
        // bottom
        if (j < m - 1) {
          cell3d.directionBottom = map3d[i][j + 1].pos.subtract(cell3d.pos);
        }
        // left
        if (i > 0) {
          cell3d.directionLeft = map3d[i - 1][j].pos.subtract(cell3d.pos);
        }
      }
    }

    return map3d;
  }

  private _generateElevations(heightMap: number[][], maxHeight: number, spec: any): Elevation[][] {
    let n = spec.n;
    let m = spec.m;
    let elevationMap = [];

    for (let i = 0; i < n; i++) {
      let row = [];
      for (let j = 0; j < m; j++) {
        row.push(new Elevation(heightMap[i][j]  * maxHeight, i, j));
      }
      elevationMap.push(row);
    }

    // update heighbors
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        elevationMap[i][j].updateNeighbors(elevationMap);
      }
    }

    return elevationMap;
  }
}

export = Playground;
