/// <reference path="../typings/rx.all.d.ts" />

import CanvasElement = require('./CanvasElement');
import KeyboardInput = require('./KeyboardInput');
import GameWorld = require('./GameWorld');

class Game {
  constructor(private canvas : CanvasElement) {
    new GameWorld(canvas.element);

    this.run();
  }
  private run() {
    KeyboardInput.getObservable.forEach(key => {
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
  }
};

export = Game;
