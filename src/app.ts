import Game = require('./Game');
import CanvasElement = require('./CanvasElement');
import KeyboardInput = require('./KeyboardInput');
import enums = require('./enums');
import d2r = require('./tools/d2r');



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



// var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
var freeCamera = new BABYLON.FreeCamera("freeCamera", new BABYLON.Vector3(n/2, Math.min(n, m), m/2), scene);
freeCamera.setTarget(new BABYLON.Vector3(n/2, 0, m/2));
freeCamera.attachControl(canvas.element, true);


// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 10, 0), scene);
// var light = new BABYLON.DirectionalLight("Dir0", new BABYLON.Vector3(0, -1, 0), scene);
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
  // clone.scaling = new BABYLON.Vector3(size, size, size);
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
var agentCamera = new BABYLON.FreeCamera("agentCamera", new BABYLON.Vector3(pos.x, 15, pos.z), scene);
agentCamera.setTarget(agentOrigin.position);
scene.activeCamera = agentCamera;

canvas.element.onclick = (e) => {
  scene.activeCamera = scene.activeCamera !== agentCamera ? agentCamera : freeCamera;
}



//
// controlls
//
let ____CONTROLLS____;

let speed: BABYLON.Vector3 = new BABYLON.Vector3(1, 1, 1);
let direction: BABYLON.Vector3 = new BABYLON.Vector3(1, 0, 0);


KeyboardInput.getObservable.forEach(key => {
  switch (key) {
    case enums.KEYS.LEFT:
      // this._head.rotation.addInPlace(new BABYLON.Vector3(0, d2r(-90), 0));
      console.log('L');
      direction = new BABYLON.Vector3(-1, 0, 0);
      break;
    case enums.KEYS.UP:
      // this._head.rotation.addInPlace(new BABYLON.Vector3(d2r(-90),0, 0));
      console.log('U');
      direction = new BABYLON.Vector3(0, 0, 1);
      break;
    case enums.KEYS.RIGHT:
      // this._head.rotation.addInPlace(new BABYLON.Vector3(0, d2r(90), 0));
      console.log('R');
      direction = new BABYLON.Vector3(1, 0, 0);
      break;
    case enums.KEYS.DOWN:
      // this._head.rotation.addInPlace(new BABYLON.Vector3(d2r(90), 0, 0));
      console.log('D');
      direction = new BABYLON.Vector3(0, 0, -1);
      break;
  }
});

engine.runRenderLoop(() => {
  let sec = engine.getDeltaTime() / 1000;

  let delta = speed.multiplyByFloats(sec, sec, sec).multiplyInPlace(direction);
  agentOrigin.position.addInPlace(delta);
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



// Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
// var ground = BABYLON.Mesh.CreateGround("ground1", 2, 2, 2, scene);
// let ortMat = new BABYLON.StandardMaterial('gmat', scene);
// ortMat.diffuseColor = BABYLON.Color3.Black();
// ortMat.diffuseTexture = new BABYLON.Texture('assets/textures/orient.jpg', scene);
// ortMat.emissiveTexture = new BABYLON.Texture('assets/textures/orient.jpg', scene);
// ground.material = ortMat;
