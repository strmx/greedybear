
#build
https://github.com/Microsoft/TypeScript/pull/5090


# NOW
- move the cube using the keyboard left, right, top, bottom
@Button
old->new

L           x y z
 1 0 0  ->  0 0 1   right->far
-1 0 0  ->  0 0-1   left->near
 0 1 0  -> -1 0 0   up->
 0-1 0  ->

- add camera that is sticked (directed) to the cube c<[] and moves with it
- constrain movement by cell size








================================================================

# ENVIRONMENT
- http-server --cors -o -p 9999

# DESKTOP CHROME
devicemotion: true
deviceorientation: true
fullscreen: true
vibrate: true
webgl: true
batteryapi: false
lowbattery: false
pointerevents: false
proximity: false
touchevents: false

# DESKTOP FF
batteryapi: true
