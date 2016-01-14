/// <reference path="../typings/rx.all.d.ts" />

const KEY_MAP = {
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  32: 'space',
  27: 'escape',
}

export = class KeyboardInput {
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
      .filter((e:KeyboardEvent) => (!!KEY_MAP[e.keyCode]))
      .map((e:KeyboardEvent) => (KEY_MAP[e.keyCode]));
  }
};
