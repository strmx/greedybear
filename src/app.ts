import Game = require('./Game');
import CanvasElement = require('./CanvasElement');
import KeyboardInput = require('./KeyboardInput');
import enums = require('./enums');
import d2r = require('./tools/d2r');

const V2 = BABYLON.Vector2;
const V3 = BABYLON.Vector3;

const ANGLE_RIGHT = 0;
const ANGLE_BOTTOM = 1.5707963267948966;
const ANGLE_LEFT = 3.141592653589793;
const ANGLE_TOP = -1.5707963267948966;

//////////////////////
// MAP GENERATION
////////////////////
let ____PATTERN____;


import Randomizer = require('./utils/Randomizer');
import CavePatternGenerator = require('./map/CavePatternGenerator');
import PatternHelper = require('./map/PatternHelper');

let t = Date.now();

let generatorOptions = {
  n: 100,
  m: 100,
  wallChance: .4,
  stepCount: 2,
  nextReal: Randomizer.generateNextRealFunction(13), //Math.random,
  birthLimit: 4,
  deathLimit: 3,
};
let pattern = CavePatternGenerator.generateCavePattern(generatorOptions);
let n = pattern.length;
let m = pattern[0].length;
console.info(Date.now() - t);



t = Date.now();
PatternHelper.removeSmallOpenAreas(pattern);
console.info(Date.now() - t);



t = Date.now();
let positions = PatternHelper.collectFreeAroundPositions(pattern);
console.info(Date.now() - t);
//
// positions.forEach(p => {
//   pattern[p.x][p.y] = Math.round(p.distance) + 3;
// });

// console.log(positions[0].distance, positions.length);
// let tm = PatternHelper.stringify(pattern)
//           .split('')
//           .map(s => {
//             let d = parseInt(s, 10);
//             if (d > 0) return d - 3;
//             return s;
//           })
//           .join('');
//
// console.log(tm);



//////////////////////
// RENDER
////////////////////

let ____RENDER____;


let canvas = new CanvasElement(document.body);
canvas.resize();

let engine: BABYLON.Engine = new BABYLON.Engine(canvas.element, true, {}, true);
var scene = new BABYLON.Scene(engine);

// engine.resize();

let stats = new Stats();
stats.setMode(0);
stats.domElement.style.cssText='position:fixed;left:0;top:0;z-index:10000';
document.body.appendChild(stats.domElement);


engine.runRenderLoop(() => {
  stats.begin();
  // let sec = engine.getDeltaTime() / 1000;
  scene.render();

  stats.end();
});


// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
var light = new BABYLON.HemisphericLight("light1", new V3(0, 10, 0), scene);
// var light = new BABYLON.DirectionalLight("Dir0", new V3(0, -1, 0), scene);
// light.diffuse = new BABYLON.Color3(1, 1, 1);
// light.specular = new BABYLON.Color3(1, 1, 1);

// Default intensity is 1. Let's dim the light a small amount
light.intensity = 0.7;



/////////////////////////
// add game  elements
///////////////////////
let ____MAP____;

//
// static map
//

let groundMat = new BABYLON.StandardMaterial('groundMat', scene);
groundMat.diffuseColor = BABYLON.Color3.White();
let wallMat = new BABYLON.StandardMaterial('wallMat', scene);
wallMat.diffuseColor = BABYLON.Color3.Black();
wallMat.specularColor = BABYLON.Color3.White();

// let wallOriginalPlane = BABYLON.Mesh.CreatePlane("wallOriginal", 1, scene, false, BABYLON.Mesh.FRONTSIDE);
let wallOriginal = BABYLON.Mesh.CreateBox("wallOriginal", 1, scene, false, BABYLON.Mesh.FRONTSIDE);
wallOriginal.position.y = .5;
wallOriginal.rotation.x = Math.PI / 2;
wallOriginal.material = wallMat;
let groundOriginal = BABYLON.Mesh.CreatePlane("groundOriginal", 1, scene, false, BABYLON.Mesh.FRONTSIDE);
groundOriginal.rotation.x = Math.PI / 2;
groundOriginal.material = groundMat;

for (let i = 0; i < n; i++) {
  for (let j = 0; j < m; j++) {
    let clone = (pattern[i][j] ? wallOriginal : groundOriginal).createInstance(`cell${i}:${j}`);
    clone.position.x = i;
    clone.position.z = j;
  }
}

//
// apples
//
let ____APPLES____;

// Our built-in 'sphere' shape. Params: name, subdivs, size, scene
var appleOrigin = BABYLON.Mesh.CreateSphere("appleOrigin", 8, 1, scene, false, BABYLON.Mesh.FRONTSIDE);
appleOrigin.position.y = .5;
let appleMat = new BABYLON.StandardMaterial('appleMat', scene);
appleMat.diffuseColor = BABYLON.Color3.Red();
appleOrigin.material = appleMat;

let biggestAppleSize = (positions[1] && positions[1].distance) || 1;
positions.slice(1).forEach(p => {
  let clone = appleOrigin.createInstance(`apple${p.x}:${p.y}`);
  clone.position.x = p.x;
  clone.position.z = p.y;
  let size =p.distance / biggestAppleSize;
  // clone.scaling = new V3(size, size, size);
});

//
// agent
//
let ____AGENT____;

var agentOrigin = BABYLON.Mesh.CreateSphere("agent", 8, 1, scene, false, BABYLON.Mesh.FRONTSIDE);
agentOrigin.position.y = .5;
let agentMat = new BABYLON.StandardMaterial('agentMat', scene);
agentMat.diffuseColor = BABYLON.Color3.Green();
agentOrigin.material = agentMat;
let agentPos = positions[0];
agentOrigin.position.x = agentPos.x;
agentOrigin.position.z = agentPos.y;

//
// agent camera
//
let ____AGENTCAMERA____;

let pos = agentOrigin.position;
// var agentCamera = new BABYLON.FollowCamera("agentCamera", new V3(pos.x, 10, pos.z), scene);
var agentCamera = new BABYLON.FollowCamera("agentCamera", new V3(pos.x - 3, 10, pos.z - 1), scene);
agentCamera.target = agentOrigin;
agentCamera.radius = 8; // how far from the object to follow
agentCamera.heightOffset = 10; // how high above the object to place the camera
agentCamera.rotationOffset = 270; // the viewing angle
agentCamera.cameraAcceleration = 0.025 // how fast to move
agentCamera.maxCameraSpeed = 2 // speed limit

scene.activeCamera = agentCamera;

//
// controlls
//
let ____CONTROLLS____;

let speed = 1;
let speedV2 = new V2(speed, speed);
let speedV3 = new V3(speed, speed, speed);
let directionV2 = new V2(1, 0);
let directionV3 = new V3(1, 0, 0);
let rotation = agentOrigin.rotation;
let aPos: BABYLON.Vector2 = new V2(agentOrigin.position.x, agentOrigin.position.z);
let aCellPos: BABYLON.Vector2 = aPos.clone();
let lastPressedNavigationKey = null;

function rotateToLeft() {
  directionV3 = new V3(-1, 0, 0);
  directionV2 = new V2(-1, 0);
  rotation.y = ANGLE_LEFT;
  console.log(rotation.y, directionV3);
}
function rotateToBottom() {
  directionV3 = new V3(0, 0, -1);
  directionV2 = new V2(0, -1);
  rotation.y = ANGLE_BOTTOM;
  console.log(rotation.y, directionV3);
}
function rotateToRight() {
  directionV3 = new V3(1, 0, 0);
  directionV2 = new V2(1, 0);
  rotation.y = ANGLE_RIGHT;
  console.log(rotation.y, directionV3);
}
function rotateToTop() {
  directionV3 = new V3(0, 0, 1);
  directionV2 = new V2(0, 1);
  rotation.y = ANGLE_TOP;
  console.log(rotation.y, directionV3);
}

KeyboardInput.getObservable.forEach(key => {
  switch (key) {
    // navigation
    case enums.KEYS.RIGHT:
      lastPressedNavigationKey = key;
      break;
    case enums.KEYS.LEFT:
      lastPressedNavigationKey = key;
      break;
    // speed (TODO: remove for production)
    case enums.KEYS.UP:
      speedV3.addInPlace(new V3(.5, .5, .5));
      break;
    case enums.KEYS.DOWN:
      speedV3.subtractInPlace(new V3(.5, .5, .5));
      break;
    default:
  }
});

function shiftAgent(tickDistance: number) {
  let shift = new V2(tickDistance, tickDistance).multiply(directionV2);
  let nextPos = aPos.add(shift);
  let cellDiff = nextPos.subtract(aCellPos);
  let fromPrevCellDistance = cellDiff.length();

  if (fromPrevCellDistance < 1) {
    aPos = nextPos;
    agentOrigin.position.x = nextPos.x;
    agentOrigin.position.z = nextPos.y;
  } else {
    //
    // 1. move to next cell
    //
    let beforeNextCellDistance = 1 - aPos.subtract(aCellPos).length();
    // used switch to use integers
    switch(rotation.y) {
      case ANGLE_RIGHT:
        nextPos.x = aCellPos.x + 1;
        break;
      case ANGLE_BOTTOM:
        nextPos.y = aCellPos.y - 1;
        break;
      case ANGLE_LEFT:
        nextPos.x = aCellPos.x - 1;
        break;
      case ANGLE_TOP:
        nextPos.y = aCellPos.y + 1;
        break;
    }
    aCellPos.x = nextPos.x;
    aCellPos.y = nextPos.y;

    //
    // apply navigation change (afte keypress)
    //
    if (lastPressedNavigationKey !== null) {
      console.log('apply ', lastPressedNavigationKey);
      switch (lastPressedNavigationKey) {
        case enums.KEYS.LEFT:
          switch(rotation.y) {
            case ANGLE_RIGHT:
              rotateToTop();
              break;
            case ANGLE_BOTTOM:
              rotateToRight();
              break;
            case ANGLE_LEFT:
              rotateToBottom();
              break;
            case ANGLE_TOP:
              rotateToLeft();
              break;
          }
          break;
        case enums.KEYS.RIGHT:
          switch(rotation.y) {
            case ANGLE_RIGHT:
              rotateToBottom();
              break;
            case ANGLE_BOTTOM:
              rotateToLeft();
              break;
            case ANGLE_LEFT:
              rotateToTop();
              break;
            case ANGLE_TOP:
              rotateToRight();
              break;
          }
          break;
      }

        lastPressedNavigationKey = null;
    }

    //
    // TODO: check collision
    // calculate future cell
    // check availability on pattern

    //
    // move further
    //
    let remainDistance = fromPrevCellDistance - 1;
    shiftAgent(remainDistance);
  }
}


engine.runRenderLoop(() => {
  let sec = engine.getDeltaTime() / 1000;
  let distance = sec * speed;
  shiftAgent(distance);
});



// this.world.observable.subscribe(
//   (sec : number) => {
//     let shift = this._moveSpeed.multiplyByFloats(sec, sec, sec);
//     shift.multiplyInPlace(this._moveDirection);
//     this.world._head.position.addInPlace(shift);
//   },
//   (err) => {},
//   () => {}
// );


//
// all camera
//
let ____ALLCAMERA____;

// var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
var freeCamera = new BABYLON.FreeCamera("freeCamera", new V3(n/2, Math.min(n, m), m/2), scene);
freeCamera.setTarget(new V3(n/2, 0, m/2));
freeCamera.attachControl(canvas.element, true);

canvas.element.onclick = (e) => {
  scene.activeCamera = scene.activeCamera !== agentCamera ? agentCamera : freeCamera;
}


// Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
// var ground = BABYLON.Mesh.CreateGround("ground1", 2, 2, 2, scene);
// let ortMat = new BABYLON.StandardMaterial('gmat', scene);
// ortMat.diffuseColor = BABYLON.Color3.Black();
// ortMat.diffuseTexture = new BABYLON.Texture('assets/textures/orient.jpg', scene);
// ortMat.emissiveTexture = new BABYLON.Texture('assets/textures/orient.jpg', scene);
// ground.material = ortMat;
