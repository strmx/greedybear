/// <reference path="../typings/rx.all.d.ts" />

import CanvasElement = require('./CanvasElement');
import KeyboardInput = require('./KeyboardInput');
import GameWorld = require('./GameWorld');

class Game {
  private world: GameWorld;

  private _moveSpeed: BABYLON.Vector3 = new BABYLON.Vector3(5, 5, 5);
  private _moveDirection: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0);

  constructor(private canvas : CanvasElement) {
    this.world = new GameWorld(canvas.element);
    this.run();
  }
  private run() {
    KeyboardInput.getObservable.forEach(key => {
      switch (key) {
        case KeyboardInput.KEYS.LEFT:
          this._moveDirection.copyFromFloats(-1, 0, 0);
          break;
        case KeyboardInput.KEYS.UP:
          this._moveDirection.copyFromFloats(0, 0, 1);
          break;
        case KeyboardInput.KEYS.RIGHT:
          this._moveDirection.copyFromFloats(1, 0, 0);
          break;
        case KeyboardInput.KEYS.DOWN:
          this._moveDirection.copyFromFloats(0, 0, -1);
          break;
        case KeyboardInput.KEYS.A:
          this._moveDirection.copyFromFloats(0, 1, 0);
          break;
        case KeyboardInput.KEYS.Z:
          this._moveDirection.copyFromFloats(0, -1, 0);
          break;
      }
    });

    this.world.subject.subscribe(
      (sec : number) => {
        let shift = this._moveSpeed.multiplyByFloats(sec, sec, sec);
        shift.multiplyInPlace(this._moveDirection);
        this.world.cube.position.addInPlace(shift);
      },
      (err) => {

      },
      () => {

      }
    );
  }
};

export = Game;
