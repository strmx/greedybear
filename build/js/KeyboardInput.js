/// <reference path="../typings/rx.all.d.ts" />
define(["require", "exports"], function (require, exports) {
    var KEYS;
    (function (KEYS) {
        KEYS[KEYS["left"] = 0] = "left";
        KEYS[KEYS["up"] = 1] = "up";
        KEYS[KEYS["right"] = 2] = "right";
        KEYS[KEYS["down"] = 3] = "down";
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
                //   },
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
            37: KEYS.left,
            38: KEYS.up,
            39: KEYS.right,
            40: KEYS.down,
        };
        return KeyboardInput;
    })();
    ;
    return KeyboardInput;
});
