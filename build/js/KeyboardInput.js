/// <reference path="../typings/rx.all.d.ts" />
define(["require", "exports"], function (require, exports) {
    var KEY_MAP = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        32: 'space',
        27: 'escape',
    };
    return (function () {
        function KeyboardInput() {
        }
        Object.defineProperty(KeyboardInput, "Name", {
            get: function () {
                return 'Foo._name';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(KeyboardInput, "getObservable", {
            get: function () {
                var keydown = Rx.Observable.fromEvent(document, 'keydown');
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
                    .filter(function (e) { return (!!KEY_MAP[e.keyCode]); })
                    .map(function (e) { return (KEY_MAP[e.keyCode]); });
            },
            enumerable: true,
            configurable: true
        });
        return KeyboardInput;
    })();
});
