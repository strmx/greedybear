/// <reference path="../typings/rx.all.d.ts" />

import CanvasElement = require('./CanvasElement');
import KeyboardInput = require('./KeyboardInput');

class Game {
  constructor(private canvas : CanvasElement) {
    this.start();
  }
  private start() {
    KeyboardInput.getObservable.forEach(e => {
      console.info(e);
    });
  }
};

export = Game;
