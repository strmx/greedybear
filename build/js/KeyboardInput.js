/// <reference path="../typings/rx.all.d.ts" />
define(["require", "exports"], function (require, exports) {
    var KEYS;
    (function (KEYS) {
        KEYS[KEYS["LEFT"] = 0] = "LEFT";
        KEYS[KEYS["UP"] = 1] = "UP";
        KEYS[KEYS["RIGHT"] = 2] = "RIGHT";
        KEYS[KEYS["DOWN"] = 3] = "DOWN";
        KEYS[KEYS["A"] = 4] = "A";
        KEYS[KEYS["Z"] = 5] = "Z";
    })(KEYS || (KEYS = {}));
    var KeyboardInput = (function () {
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
                //     },
                //   err => {
                //     console.log('Error: %s', err);
                //   },
                //   () => {
                //     console.log('Completed keydown');
                //   }
                // );
                return keydown
                    .filter(function (e) { return (KeyboardInput.KEY_MAP[e.keyCode] !== undefined); })
                    .map(function (e) { return (KeyboardInput.KEY_MAP[e.keyCode]); });
            },
            enumerable: true,
            configurable: true
        });
        KeyboardInput.KEYS = KEYS;
        KeyboardInput.KEY_MAP = {
            37: KEYS.LEFT,
            38: KEYS.UP,
            39: KEYS.RIGHT,
            40: KEYS.DOWN,
            65: KEYS.A,
            90: KEYS.Z,
        };
        return KeyboardInput;
    })();
    ;
    return KeyboardInput;
});
