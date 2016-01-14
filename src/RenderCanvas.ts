/// <reference path="../typings/jquery/jquery.d.ts" />

class TestCanvas {
    private container: HTMLElement;
    private canvas: HTMLCanvasElement;

    constructor(parent: HTMLElement = document.body) {
      this.canvas = document.createElement('canvas');
      this.canvas.classList.add('canvas3d');
      this.container.appendChild(this.canvas);

      this.$canvas.attr('touch-action', 'auto');

      document.body.appendChild(this.container);
    }
    public get canvasElement(): HTMLCanvasElement {
        return <HTMLCanvasElement>this.$canvas.get(0);
    }
    public get $canvas(): JQuery {
        return $('canvas');
    }
    // public get titleElement(): HTMLElement {
    //     return this.title;
    // }
    // destroy() {
    //     this.container.parentElement.removeChild(this.container);
    // }
}

export = TestCanvas;
