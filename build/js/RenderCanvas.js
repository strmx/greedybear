/// <reference path="../typings/jquery/jquery.d.ts" />
define(["require", "exports"], function (require, exports) {
    var TestCanvas = (function () {
        function TestCanvas(parent) {
            if (parent === void 0) { parent = document.body; }
            this.canvas = document.createElement('canvas');
            this.canvas.classList.add('canvas3d');
            this.container.appendChild(this.canvas);
            this.$canvas.attr('touch-action', 'auto');
            document.body.appendChild(this.container);
        }
        Object.defineProperty(TestCanvas.prototype, "canvasElement", {
            get: function () {
                return this.$canvas.get(0);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TestCanvas.prototype, "$canvas", {
            get: function () {
                return $('canvas');
            },
            enumerable: true,
            configurable: true
        });
        return TestCanvas;
    })();
    return TestCanvas;
});
