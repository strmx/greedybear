// /// <reference path="../typings/interfaces.d.ts"/>
//
// import enums = require('./enums');
// import CanvasElement = require('./CanvasElement');
// import KeyboardInput = require('./KeyboardInput');
// import GameWorld = require('./GameWorld');
// import d2r = require('./tools/d2r');
//
// class Game {
//   private world: GameWorld;
//   private _head : BABYLON.Mesh;
//   private _moveSpeed: BABYLON.Vector3 = new BABYLON.Vector3(5, 5, 5);
//   private _moveDirection: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0);
//
//   constructor(private canvas : CanvasElement, pattern: number[][]) {
//     this.world = new GameWorld(canvas.element);
//     this._head = this.world._head;
//     this.run();
//   }
//
//   private run() {
//     KeyboardInput.getObservable.forEach(key => {
//       switch (key) {
//         case enums.KEYS.LEFT:
//           this._head.rotation.addInPlace(new BABYLON.Vector3(0, d2r(-90), 0));
//           console.log(this._head.rotation);
//           break;
//         case enums.KEYS.UP:
//           this._head.rotation.addInPlace(new BABYLON.Vector3(d2r(-90),0, 0));
//           console.log(this._head.rotation);
//           break;
//         case enums.KEYS.RIGHT:
//           this._head.rotation.addInPlace(new BABYLON.Vector3(0, d2r(90), 0));
//           console.log(this._head.rotation);
//           break;
//         case enums.KEYS.DOWN:
//           this._head.rotation.addInPlace(new BABYLON.Vector3(d2r(90), 0, 0));
//           console.log(this._head.rotation);
//           break;
//       }
//     });
//
//     this.world.observable.subscribe(
//       (sec : number) => {
//         let shift = this._moveSpeed.multiplyByFloats(sec, sec, sec);
//         shift.multiplyInPlace(this._moveDirection);
//         this.world._head.position.addInPlace(shift);
//       },
//       (err) => {},
//       () => {}
//     );
//   }
// };
//
// export = Game;
