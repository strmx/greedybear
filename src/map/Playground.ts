/// <reference path="../../typings/Interfaces.d.ts" />

import CavePatternGenerator = require('./CavePatternGenerator');
import PatternHelper = require('./PatternHelper');
import Elevation = require('./Elevation');
import types = require('../types');
import Thing = require('../game/Thing');

const WORLD_OBJECT = types.ThingType;
const V2 = BABYLON.Vector2;
const V3 = BABYLON.Vector3;

class Playground {
  map: number[][]
  boundaries: number[][]
  heightMap: number[][]
  maxHeight: number
  elevationMap: Elevation[][]
  map3d: Map3DCell[][]
  startPoints: DistancePoint[]
  wallRects: RectArea[]

  constructor(spec: GameDataOptions) {
    const nextReal = (<any>window).nextReal;
    let {n, m} = spec;

    // initialise cave pattern
    let pattern = CavePatternGenerator.generateCavePattern(spec);

    // free around cells
    for (let i=0; i<spec.n; i++) {
      if (nextReal() > .05) pattern[i][0] = 0;
      if (nextReal() > .05) pattern[i][m - 1] = 0;
    }
    for (let i=0; i<spec.n; i++) {
      if (nextReal() > .05) pattern[0][i] = 0;
      if (nextReal() > .05) pattern[n - 1][i] = 0;
    }

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
    // this.lakes = this._generateLakes(pattern);
    this.startPoints = PatternHelper.collectFreeAroundPositions(pattern, bypass);
    this.heightMap = PatternHelper.generateElevations(spec.n, spec.m, nextReal);
    this.elevationMap = this._generateElevations(this.heightMap, this.maxHeight, spec);
    this.map3d = this._generate3DMap(this.elevationMap);
    console.log(this.map3d);
  }

  private _generateLakes(pattern: number[][]) {
    let closedAreas = PatternHelper.findOpenAreas(pattern, 1);

    if (closedAreas.length === 0) {
      return;
    }

    if (closedAreas.length > 1) {
      // remove open areas
      closedAreas
        // except biggest area
        .slice(1)
        .forEach((cells) => {
          cells.forEach((pos) => {
            pattern[pos.x][pos.y] = 1;
          });
        });
    }

    return closedAreas[0];
  }

  private _generate3DMap(elevationMap: Elevation[][]): Map3DCell[][] {
    let n = elevationMap.length;
    let m = elevationMap[0].length;
    let map3d: Map3DCell[][] = [];

    for (let i = 0; i < n; i++) {
      let row = [];
      for (let j = 0; j < m; j++) {
        let pos = new BABYLON.Vector3(i, elevationMap[i][j].height, j);
        row.push({
          pos,
          directionTop: null,
          directionRight: null,
          directionBottom: null,
          directionLeft: null,
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
          // TODO: findout why it's inverted (directionBottom/directionTop)
          cell3d.directionBottom = map3d[i][j - 1].pos.subtract(cell3d.pos);
        }
        // right
        if (i < n - 1) {
          cell3d.directionRight = map3d[i + 1][j].pos.subtract(cell3d.pos);
        }
        // bottom
        if (j < m - 1) {
          // TODO: findout why it's inverted (directionBottom/directionTop)
          cell3d.directionTop = map3d[i][j + 1].pos.subtract(cell3d.pos);
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
