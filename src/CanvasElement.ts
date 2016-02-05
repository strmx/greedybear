/// <reference path="../typings/interfaces.d.ts"/>

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

    public destroy(): void {
      this.canvas.parentElement.removeChild(this.canvas);
    }

    public resize(w?: number, h?: number): void {
      this.canvas.height = w || window.innerHeight;
      this.canvas.width = h || window.innerWidth;
    }

}

export = CanvasElement;
