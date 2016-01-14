/// <reference path="../typings/rx.all.d.ts" />
define(["require", "exports", './KeyboardInput', './GameWorld'], function (require, exports, KeyboardInput, GameWorld) {
    var Game = (function () {
        function Game(canvas) {
            this.canvas = canvas;
            new GameWorld(canvas.element);
            this.run();
        }
        Game.prototype.run = function () {
            KeyboardInput.getObservable.forEach(function (key) {
                switch (key) {
                    case KeyboardInput.KEYS.left:
                        console.log('L');
                        break;
                    case KeyboardInput.KEYS.up:
                        console.log('U');
                        break;
                    case KeyboardInput.KEYS.right:
                        console.log('R');
                        break;
                    case KeyboardInput.KEYS.down:
                        console.log('D');
                        break;
                }
            });
        };
        return Game;
    })();
    ;
    return Game;
});
