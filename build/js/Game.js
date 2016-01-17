/// <reference path="../typings/rx.all.d.ts" />
define(["require", "exports", './KeyboardInput', './GameWorld'], function (require, exports, KeyboardInput, GameWorld) {
    var Game = (function () {
        function Game(canvas) {
            this.canvas = canvas;
            this._moveSpeed = new BABYLON.Vector3(5, 5, 5);
            this._moveDirection = new BABYLON.Vector3(0, 0, 0);
            this.world = new GameWorld(canvas.element);
            this._head = this.world._head;
            this.run();
        }
        Game.prototype.run = function () {
            var _this = this;
            KeyboardInput.getObservable.forEach(function (key) {
                switch (key) {
                    case KeyboardInput.KEYS.LEFT:
                        // BABYLON.Vector3.RotationFromAxis()
                        var mesh;
                        _this._head.rotate(BABYLON.Axis.Y, -90 * (Math.PI / 180), BABYLON.Space.WORLD);
                        console.log(_this._head.rotation);
                        break;
                    case KeyboardInput.KEYS.UP:
                        _this._head.rotate(BABYLON.Axis.X, -90 * (Math.PI / 180), BABYLON.Space.WORLD);
                        console.log(_this._head.rotation);
                        break;
                    case KeyboardInput.KEYS.RIGHT:
                        _this._head.rotate(BABYLON.Axis.Y, 90 * (Math.PI / 180), BABYLON.Space.WORLD);
                        console.log(_this._head.rotation);
                        break;
                    case KeyboardInput.KEYS.DOWN:
                        _this._head.rotate(BABYLON.Axis.X, 90 * (Math.PI / 180), BABYLON.Space.WORLD);
                        console.log(_this._head.rotation);
                        break;
                }
            });
            this.world.subject.subscribe(function (sec) {
                var shift = _this._moveSpeed.multiplyByFloats(sec, sec, sec);
                shift.multiplyInPlace(_this._moveDirection);
                _this.world._head.position.addInPlace(shift);
            }, function (err) {
            }, function () {
            });
        };
        return Game;
    })();
    ;
    return Game;
});
