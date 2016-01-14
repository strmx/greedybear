/// <reference path="../typings/rx.all.d.ts" />
define(["require", "exports", './KeyboardInput'], function (require, exports, KeyboardInput) {
    return (function () {
        function Game() {
            this.start();
        }
        Game.prototype.start = function () {
            KeyboardInput.getObservable.forEach(function (e) {
                console.info(e);
            });
        };
        return Game;
    })();
});
