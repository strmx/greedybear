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
    67: KEYS.C,
    90: KEYS.Z,
  }

  static get Name() {
    return 'Foo._name';
  }

  static get getObservable() {
    let keydown = Rx.Observable.fromEvent(document, 'keydown');
    let touchStart = Rx.Observable.fromEvent(document, 'touchstart');

    // translate to <-- and -->
    let touchTranslated = touchStart.map((e: TouchEvent) => {
      try {
        let pageX = e.touches[0].pageX;
        let isLeftSide = pageX < window.innerWidth / 2;
        return isLeftSide ? KEYS.LEFT : KEYS.RIGHT;
      } catch (err) {
        console.log(err);
        alert('touch translation problem:' + err.message);
      }
      return null;
    });

    let keyDownTranslated = keydown
      .filter((e:KeyboardEvent) => (KeyboardInput.KEY_MAP[e.keyCode] !== undefined))
      .map((e:KeyboardEvent) => (KeyboardInput.KEY_MAP[e.keyCode]));

    return Rx.Observable.merge(keyDownTranslated, touchTranslated)
      .filter((key) => (key !== null));
  }
};

export = KeyboardInput;
