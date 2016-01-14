define(["require", "exports", './Game', './CanvasElement'], function (require, exports, Game, CanvasElement) {
    var game = new Game(new CanvasElement(document.body));
});
