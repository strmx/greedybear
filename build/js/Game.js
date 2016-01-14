/// <reference path="../typings/rx.all.d.ts" />
define(["require", "exports", './KeyboardInput'], function (require, exports, KeyboardInput) {
    var Game = (function () {
        function Game(canvas) {
            this.canvas = canvas;
            this.start();
        }
        Game.prototype.start = function () {
            KeyboardInput.getObservable.forEach(function (e) {
                console.info(e);
            });
        };
        return Game;
    })();
    ;
    return Game;
});
