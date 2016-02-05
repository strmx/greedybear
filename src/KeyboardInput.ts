/// <reference path="../typings/interfaces.d.ts"/>

import enums = require('./enums');

const KEYS = enums.KEYS;

class KeyboardInput {

  public static KEY_MAP = {
    37: KEYS.LEFT,
    38: KEYS.UP,
    39: KEYS.RIGHT,
    40: KEYS.DOWN,
    65: KEYS.A,
    90: KEYS.Z,
  }

  static get Name() {
    return 'Foo._name';
  }

  static get getObservable() {
    let keydown = Rx.Observable.fromEvent(document, 'keydown');

    // // for testing
    // let subscription = keydown.subscribe(
    //   x => {
    //     console.log('Next: keydown!', x);
    //     },
    //   err => {
    //     console.log('Error: %s', err);
    //   },
    //   () => {
    //     console.log('Completed keydown');
    //   }
    // );

    return keydown
      .filter((e:KeyboardEvent) => (KeyboardInput.KEY_MAP[e.keyCode] !== undefined))
      .map((e:KeyboardEvent) => (KeyboardInput.KEY_MAP[e.keyCode]));
  }
};

export = KeyboardInput;
