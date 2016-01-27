/// <reference path="../typings/jquery/jquery.d.ts" />

const CSS_STYLES = `
  position: absolute;
  _width: 100%;
  _height: 100%;
`;

class CanvasElement {
    private canvas: HTMLCanvasElement;

    constructor(parent: HTMLElement) {
      this.canvas = document.createElement('canvas');
      this.canvas.setAttribute('style', CSS_STYLES);
      parent.appendChild(this.canvas);
    }

    public get element(): HTMLCanvasElement {
        return this.canvas;
    }

    public destroy() {
      this.canvas.parentElement.removeChild(this.canvas);
    }
}

export = CanvasElement;
