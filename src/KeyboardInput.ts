/// <reference path="../typings/rx.all.d.ts" />

enum KEYS {
    left,
    up,
    right,
    down,
}

class KeyboardInput {
  public static KEYS = KEYS;

  public static KEY_MAP = {
    37: KEYS.left,
    38: KEYS.up,
    39: KEYS.right,
    40: KEYS.down,
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
      //   },
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
