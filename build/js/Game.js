/// <reference path="../typings/rx.all.d.ts" />
define(["require", "exports", './KeyboardInput', './GameWorld'], function (require, exports, KeyboardInput, GameWorld) {
    var Game = (function () {
        function Game(canvas) {
            this.canvas = canvas;
            this._moveSpeed = new BABYLON.Vector3(5, 5, 5);
            this._moveDirection = new BABYLON.Vector3(0, 0, 0);
            this.world = new GameWorld(canvas.element);
            this.run();
        }
        Game.prototype.run = function () {
            var _this = this;
            KeyboardInput.getObservable.forEach(function (key) {
                switch (key) {
                    case KeyboardInput.KEYS.LEFT:
                        _this._moveDirection.copyFromFloats(-1, 0, 0);
                        break;
                    case KeyboardInput.KEYS.UP:
                        _this._moveDirection.copyFromFloats(0, 0, 1);
                        break;
                    case KeyboardInput.KEYS.RIGHT:
                        _this._moveDirection.copyFromFloats(1, 0, 0);
                        break;
                    case KeyboardInput.KEYS.DOWN:
                        _this._moveDirection.copyFromFloats(0, 0, -1);
                        break;
                    case KeyboardInput.KEYS.A:
                        _this._moveDirection.copyFromFloats(0, 1, 0);
                        break;
                    case KeyboardInput.KEYS.Z:
                        _this._moveDirection.copyFromFloats(0, -1, 0);
                        break;
                }
            });
            this.world.subject.subscribe(function (sec) {
                var shift = _this._moveSpeed.multiplyByFloats(sec, sec, sec);
                shift.multiplyInPlace(_this._moveDirection);
                _this.world.cube.position.addInPlace(shift);
            }, function (err) {
            }, function () {
            });
        };
        return Game;
    })();
    ;
    return Game;
});
