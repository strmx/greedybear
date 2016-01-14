/// <reference path="../typings/rx.all.d.ts" />

import KeyboardInput = require('./KeyboardInput');

export = class Game {
  constructor() {
    this.start();
  }
  private start() {
    KeyboardInput.getObservable.forEach(e => {
      console.info(e);
    });
  }
};
