/// <reference path="../../typings/Interfaces.d.ts" />

import CavePatternGenerator = require('./CavePatternGenerator');
import LakeGenerator = require('./LakeGenerator');
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
  lakes: LakeArea[]

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
    this.lakes = LakeGenerator.generateLakes(this.map, spec.lakeChance, spec.lakeMinSize);

    // combine all lake maps
    let lakesCells: Point[] = [];
    this.lakes.forEach((lake: LakeArea) => {
      lakesCells = lakesCells.concat(lake.cells);
    });

    this.heightMap = PatternHelper.generateHeightMap(n, m, spec.heightInterpolationCount, lakesCells);
    // this.elevationMap = this._generateElevations(this.heightMap, this.maxHeight, spec);
    // this.map3d = this._generate3DMap(this.elevationMap);

    this.wallRects = PatternHelper.calculateRectBlocks(this.map, 1);
    this.boundaries = PatternHelper.clone(pattern);
    this.startPoints = PatternHelper.collectFreeAroundPositions(pattern, bypass);
  }

  updateElevationMap(surfaceMesh: BABYLON.AbstractMesh) {
    const n = this.heightMap.length;
    const m = this.heightMap[0].length;
    const scene = surfaceMesh.getScene();

    let yPosMap: number[][] = PatternHelper.createFilled(n, m, 0);

    let intersectionDirection = new BABYLON.Vector3(0, -1, 0);
    let intersectionPos = new BABYLON.Vector3(0, this.maxHeight + 1, 0);
    let rayPick: BABYLON.Ray;
    let pickInfo: BABYLON.PickingInfo;
    let el: Elevation;

    // let cubeBlueprint = BABYLON.Mesh.CreateBox('b', .1, scene);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        intersectionPos.x = i - surfaceMesh.position.x;
        intersectionPos.z = j - surfaceMesh.position.z;
        rayPick = new BABYLON.Ray(intersectionPos, intersectionDirection);
        pickInfo = surfaceMesh.intersects(rayPick, true);

        // console.log(intersectionPos)

        if (pickInfo && pickInfo.pickedPoint) {
          yPosMap[i][j] = pickInfo.pickedPoint.y;

          // VISUAL TESTING OF ELEVATION SURFACE
          // -----------------------------------
          // let cube = cubeBlueprint.createInstance('box');
          // cube.position = new BABYLON.Vector3(i, pickInfo.pickedPoint.y, j);
          // if (thingMap && thingMap[i] && thingMap[i][j]) {
          //   let thing = thingMap[i][j];
          //   thing.pos0.y = thing.position.y = pickInfo.pickedPoint.y;
          // }

        } else {
          console.error('out of surf', i, j);
        }
      }
    }

    // update
    this.elevationMap = this._generateElevations(yPosMap);
    this.map3d = this._generate3DMap(this.elevationMap);
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

  private _generateElevations(yPosMap: number[][]): Elevation[][] {
    let n = yPosMap.length;
    let m = yPosMap[0].length;
    let elevationMap = [];

    for (let i = 0; i < n; i++) {
      let row = [];
      for (let j = 0; j < m; j++) {
        row.push(new Elevation(yPosMap[i][j], i, j));
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
