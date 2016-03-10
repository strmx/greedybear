/// <reference path='./chai.d.ts' />
/// <reference path="./rx.all.d.ts" />
/// <reference path="./babylon.2.2.d.ts" />

interface GameDataOptions {
  n: number;
  m: number;
  wallChance: number;
  stepCount: number;
  birthLimit: number;
  deathLimit: number;
  maxHeight: number;
}

interface Point {
  x: number;
  y: number;
}

interface RectArea extends Point {
  id: number;
  w: number;
  h: number;
}

interface DistancePoint extends Point {
  distance: number;
}

interface FreeAroundPoint extends DistancePoint {
  radius: number;
  distanceTo(point: FreeAroundPoint): number;
}

interface Bypass {
  radiusLimit: number;
  length: number;
  points: FreeAroundPoint[];
}

interface Map3DCell {
  pos: BABYLON.Vector3;
  directionTop: BABYLON.Vector3;
  directionRight: BABYLON.Vector3;
  directionBottom: BABYLON.Vector3;
  directionLeft: BABYLON.Vector3;
}

// interface ThingParams {
//   id: number
//   type: number
//   x0: number
//   y0: number
//   x: number
//   y: number
//   w: number
//   h: number
//   rotation: number
// }

// interface Playground {
//   map: number[][],
//   boundaries: number[][],
//   startPoints: DistancePoint[],
// }

// interface Game {
//   playground: Playground
//   things: ThingParams[]
//   thingMap: ThingParams[][]
// }


  //
  // map
  //

  // class MapObjectView {
  //   public material: any;
  //   public geometry: any;
  // }

  // class MapObject {
  //   private static _idCounter = 0;
  //   public id: number;
  //   public type: string;
  //   public view: MapObjectView;
  //
  //   constructor(type: string) {
  //     this.id = MapObject._idCounter++;
  //     this.type = type;
  //   }
  // }
  //
  // class Map {
  //   public pattern: number[][];
  //   public width: number;
  //   public heigh: number;
  //   public objects: MapObject[] = [];
  // }

//
// export = Interface;


//
// globals
//

declare var Stats: any;
declare var Random: any;

//
// unit tests
//

declare var describe: Function;
declare var it: Function;
declare var beforeEach: Function;
declare var assert: Chai.Assert;
