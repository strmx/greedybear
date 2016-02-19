/// <reference path="../../typings/Interfaces.d.ts" />

// static counter
let createdObjectsCount = 0;

class Thing {
  id: number;
  type: number;
  x0: number;
  y0: number;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  // render props
  parent: BABYLON.AbstractMesh = null;

  constructor(type: number, x0: number = 0, y0: number = 0, x: number = x0, y: number = y0, w: number = 1, h: number = 1) {
    this.id = createdObjectsCount++;
    this.type = type;
    this.x0 = x0;
    this.y0 = y0;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
}

export = Thing;
