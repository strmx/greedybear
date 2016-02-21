/// <reference path="../../typings/Interfaces.d.ts" />

/**
 * use static counter for uniq ids
 */
let createdObjectsCount = 0;

class Thing {
  id: number;
  type: number;
  pos0: BABYLON.Vector3;

  /**
   * be sure not to loose the references
   * they are bound to the rendered mesh params
   */
  position: BABYLON.Vector3;
  rotation: BABYLON.Vector3 = BABYLON.Vector3.Zero();

  w: number;
  h: number;

  // render props
  parent: BABYLON.AbstractMesh = null;

  constructor(type: number, pos0: BABYLON.Vector3 = BABYLON.Vector3.Zero(), w: number = 1, h: number = 1) {
    this.id = createdObjectsCount++;
    this.type = type;
    this.pos0 = pos0;
    this.position = pos0.clone();
    this.w = w;
    this.h = h;
  }
}

export = Thing;
