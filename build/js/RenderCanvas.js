/// <reference path="../typings/jquery/jquery.d.ts" />
define(["require", "exports"], function (require, exports) {
    var CSS_STYLE = {
        position: 'absolute',
        width: '100%',
        height: '100%',
    };
    return (function () {
        function RenderCanvas(parent) {
            if (parent === void 0) { parent = document.body; }
            this.canvas = document.createElement('canvas');
            this.canvas.setAttribute('style', JSON.stringify(CSS_STYLE));
            parent.appendChild(this.canvas);
        }
        Object.defineProperty(RenderCanvas.prototype, "element", {
            get: function () {
                return this.canvas;
            },
            enumerable: true,
            configurable: true
        });
        RenderCanvas.prototype.destroy = function () {
            this.canvas.parentElement.removeChild(this.canvas);
        };
        return RenderCanvas;
    })();
});
