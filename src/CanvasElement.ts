/// <reference path="../typings/jquery/jquery.d.ts" />

const CSS_STYLES = `
  position: absolute;
  width: 100%;
  height: 100%;
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
