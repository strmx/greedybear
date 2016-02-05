/// <reference path='../typings/chai.d.ts' />
/// <reference path="../typings/rx.all.d.ts" />
/// <reference path="../typings/babylon.2.2.d.ts" />

//
// pattern
//

interface Point {
  x: number;
  y: number;
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
// unit tests
//
declare var describe: Function;
declare var it: Function;
declare var beforeEach: Function;
declare var assert: Chai.Assert;
