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


positions.forEach(p => {
  pattern[p.x][p.y] = 10;
});

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
let scene = new BABYLON.Scene(engine);
// show debug information
(<any>window).dm = () => {
  if (scene.debugLayer.isVisible())
    scene.debugLayer.hide();
  else
    scene.debugLayer.show();
};

// engine.resize();

let stats = new Stats();
stats.setMode(0);
stats.domElement.style.cssText='position:fixed;left:0;top:0;z-index:10000';
document.body.appendChild(stats.domElement);


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
    let clone = (pattern[i][j] === 1 ? wallOriginal : groundOriginal).createInstance(`cell${i}:${j}`);
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
  let size = p.distance / biggestAppleSize;
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

let scores = 0;

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
let rotation = agentOrigin.rotation.y;
let distanceFromCell: number = 0;
let aCellPos: BABYLON.Vector2 = new V2(agentOrigin.position.x, agentOrigin.position.z);
let lastPressedNavigationKey = null;

// body
interface Path {
  x: number;
  y: number;
  rotation: number;
}
let agentPath: Path[] = [];
// TODO: rename into party
let partyMembers: BABYLON.AbstractMesh[] = [];

// add current agent position
agentPath.push({
  x: aCellPos.x,
  y: aCellPos.y,
  rotation: rotation,
});

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
      speed += 1;
      break;
    case enums.KEYS.DOWN:
      speed -= 1;
      break;
    default:
  }
});

function shiftAgent() {
  if (distanceFromCell < 1) {

    //
    // update agent mesh position
    //

    let nextPos = aCellPos.clone();

    if (rotation === ANGLE_RIGHT)       nextPos.x = aCellPos.x + distanceFromCell;
    else if (rotation === ANGLE_BOTTOM) nextPos.y = aCellPos.y - distanceFromCell;
    else if (rotation === ANGLE_LEFT)   nextPos.x = aCellPos.x - distanceFromCell;
    else if (rotation === ANGLE_TOP)    nextPos.y = aCellPos.y + distanceFromCell;
    else debugger;

    agentOrigin.position.x = nextPos.x;
    agentOrigin.position.z = nextPos.y;
    agentOrigin.rotation.y = rotation;

    //
    // update party mesh position
    //

    for (let i = 0, l = partyMembers.length, pathLength = agentPath.length; i < l; i++) {
      // prev as agent.current cell
      let pathCell = agentPath[pathLength - 1 - (i + 1)];
      let member = partyMembers[i];
      let pathRotation = pathCell.rotation;

      // update direction and position on pg
      if (pathRotation === ANGLE_RIGHT) {
        member.position.x = pathCell.x + distanceFromCell;
        member.position.z = pathCell.y;
        member.rotation.y = pathRotation;
      } else if (pathRotation === ANGLE_BOTTOM) {
        member.position.x = pathCell.x;
        member.position.z = pathCell.y - distanceFromCell;
        member.rotation.y = pathRotation;
      } else if (pathRotation === ANGLE_LEFT) {
        member.position.x = pathCell.x - distanceFromCell;
        member.position.z = pathCell.y;
        member.rotation.y = pathRotation;
      } else if (pathRotation === ANGLE_TOP) {
        member.position.x = pathCell.x;
        member.position.z = pathCell.y + distanceFromCell;
        member.rotation.y = pathRotation;
      } else debugger;
    }

  } else {

    //
    // 1. move 1 cell to the direction
    //

    // used switch to use integers
    if (rotation === ANGLE_RIGHT)       aCellPos.x++;
    else if (rotation === ANGLE_BOTTOM) aCellPos.y--;
    else if (rotation === ANGLE_LEFT)   aCellPos.x--;
    else if (rotation === ANGLE_TOP)    aCellPos.y++;
    else debugger;

    distanceFromCell -= 1;

    //
    // apply navigation change (afte keypress)
    //
    if (lastPressedNavigationKey !== null) {
      switch (lastPressedNavigationKey) {
        case enums.KEYS.LEFT:
          if (rotation === ANGLE_RIGHT)       rotation = ANGLE_TOP;
          else if (rotation === ANGLE_BOTTOM) rotation = ANGLE_RIGHT;
          else if (rotation === ANGLE_LEFT)   rotation = ANGLE_BOTTOM;
          else if (rotation === ANGLE_TOP)    rotation = ANGLE_LEFT;
          else debugger;
          break;
        case enums.KEYS.RIGHT:
          if (rotation === ANGLE_RIGHT)       rotation = ANGLE_BOTTOM;
          else if (rotation === ANGLE_BOTTOM) rotation = ANGLE_LEFT;
          else if (rotation === ANGLE_LEFT)   rotation = ANGLE_TOP;
          else if (rotation === ANGLE_TOP)    rotation = ANGLE_RIGHT;
          else debugger;
          break;
      }
      lastPressedNavigationKey = null;
    }

    // update agent path
    agentPath.push({
      x: aCellPos.x,
      y: aCellPos.y,
      rotation: rotation,
    });

    //
    // check collision
    //

    let nextCell = aCellPos.clone();
    if (rotation === ANGLE_RIGHT)       nextCell.x++;
    else if (rotation === ANGLE_BOTTOM) nextCell.y--;
    else if (rotation === ANGLE_LEFT)   nextCell.x--;
    else if (rotation === ANGLE_TOP)    nextCell.y++;
    else debugger;

    let cellObjectType = pattern[nextCell.x][nextCell.y];
    if (cellObjectType === 1) {
      console.log('collision on', nextCell);
    } else if (cellObjectType === 10) {
      // eat the apple
      let apple = scene.getMeshByName(`apple${nextCell.x}:${nextCell.y}`);
      if (!apple) {
        debugger;
      }

      scores++;

      // remove the apple from pg
      pattern[nextCell.x][nextCell.y] = 0;
      // scene.removeMesh(apple);

      // add body part
      let memberMesh = apple;
      memberMesh.scaling.multiplyInPlace(new V3(.75, .75, .75));
      memberMesh.name = 'team-member-' + partyMembers.length;
      // scene.addMesh(memberMesh);
      partyMembers.push(memberMesh);
    }

    //
    // move further
    //
    shiftAgent();
  }
}

engine.runRenderLoop(() => {
  stats.begin();

  let delta = engine.getDeltaTime();
  let distance = (delta * speed) / 1000;
  distanceFromCell += distance;
  shiftAgent();

  scene.render();
  stats.end();
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
