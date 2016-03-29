/// <reference path="../../typings/interfaces.d.ts"/>

import types = require('../types');

const KEYS = types.KEYS;

class KeyboardInput {

  public static KEY_MAP = {
    37: KEYS.LEFT,
    38: KEYS.UP,
    39: KEYS.RIGHT,
    40: KEYS.DOWN,
    65: KEYS.A,
    67: KEYS.C,
    77: KEYS.M,
    68: KEYS.D,
    90: KEYS.Z,
    48: KEYS.ZERO,
    49: KEYS.ONE,
    50: KEYS.TWO,
    51: KEYS.THREE,
    52: KEYS.FOUR,
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
      .map((e:KeyboardEvent) => {
        console.log(e.keyCode);
        return e.keyCode;
      })
      .filter((keyCode) => (KeyboardInput.KEY_MAP[keyCode] !== undefined))
      .map((keyCode) => (KeyboardInput.KEY_MAP[keyCode]));

    return Rx.Observable.merge(keyDownTranslated, touchTranslated)
      .filter((key) => (key !== null));
  }
};

export = KeyboardInput;
