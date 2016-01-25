/// <reference path="../typings/rx.all.d.ts" />
define(["require", "exports", './KeyboardInput', './GameWorld', './tools/d2r'], function (require, exports, KeyboardInput, GameWorld, d2r) {
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
                        _this._head.rotation.addInPlace(new BABYLON.Vector3(0, d2r(-90), 0));
                        // this._head.rotation.x = this._head.rotation.x % Math.PI;
                        // this._head.rotation.y = this._head.rotation.y % Math.PI;
                        // this._head.rotation.z = this._head.rotation.z % Math.PI;
                        console.log(_this._head.rotation);
                        break;
                    case KeyboardInput.KEYS.UP:
                        _this._head.rotation.addInPlace(new BABYLON.Vector3(d2r(-90), 0, 0));
                        console.log(_this._head.rotation);
                        break;
                    case KeyboardInput.KEYS.RIGHT:
                        _this._head.rotation.addInPlace(new BABYLON.Vector3(0, d2r(90), 0));
                        console.log(_this._head.rotation);
                        break;
                    case KeyboardInput.KEYS.DOWN:
                        _this._head.rotation.addInPlace(new BABYLON.Vector3(d2r(90), 0, 0));
                        console.log(_this._head.rotation);
                        break;
                }
            });
            this.world.observable.subscribe(function (sec) {
                var shift = _this._moveSpeed.multiplyByFloats(sec, sec, sec);
                shift.multiplyInPlace(_this._moveDirection);
                _this.world._head.position.addInPlace(shift);
            }, function (err) { }, function () { });
        };
        return Game;
    })();
    ;
    return Game;
});
