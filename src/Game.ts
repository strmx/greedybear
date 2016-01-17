/// <reference path="../typings/rx.all.d.ts" />

import CanvasElement = require('./CanvasElement');
import KeyboardInput = require('./KeyboardInput');
import GameWorld = require('./GameWorld');

class Game {
  private world: GameWorld;
  private _head : BABYLON.Mesh;
  private _moveSpeed: BABYLON.Vector3 = new BABYLON.Vector3(5, 5, 5);
  private _moveDirection: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0);

  constructor(private canvas : CanvasElement) {
    this.world = new GameWorld(canvas.element);
    this._head = this.world._head;
    this.run();
  }
  private run() {
    KeyboardInput.getObservable.forEach(key => {
      switch (key) {
        case KeyboardInput.KEYS.LEFT:

          // BABYLON.Vector3.RotationFromAxis()
          let mesh : BABYLON.Mesh;
          this._head.rotate(BABYLON.Axis.Y, -90 * (Math.PI / 180), BABYLON.Space.WORLD);
          console.log(this._head.rotation);
          break;
        case KeyboardInput.KEYS.UP:
          this._head.rotate(BABYLON.Axis.X, -90 * (Math.PI / 180), BABYLON.Space.WORLD);
          console.log(this._head.rotation);
          break;
        case KeyboardInput.KEYS.RIGHT:
          this._head.rotate(BABYLON.Axis.Y, 90 * (Math.PI / 180), BABYLON.Space.WORLD);
          console.log(this._head.rotation);
          break;
        case KeyboardInput.KEYS.DOWN:
          this._head.rotate(BABYLON.Axis.X, 90 * (Math.PI / 180), BABYLON.Space.WORLD);
          console.log(this._head.rotation);
          break;
      }
    });

    this.world.subject.subscribe(
      (sec : number) => {
        let shift = this._moveSpeed.multiplyByFloats(sec, sec, sec);
        shift.multiplyInPlace(this._moveDirection);
        this.world._head.position.addInPlace(shift);
      },
      (err) => {

      },
      () => {

      }
    );
  }
};

export = Game;
