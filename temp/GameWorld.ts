// /// <reference path="../typings/interfaces.d.ts"/>
//
// import d2r = require('./tools/d2r');
//
// class GameWorld {
//   private engine: BABYLON.Engine;
//   private scene: BABYLON.Scene;
//   private camera: BABYLON.FreeCamera;
//   private light: BABYLON.HemisphericLight;
//
//   private _isMouseOnScene : boolean = false;
//
//   public observable = new Rx.Subject();
//   public _head : BABYLON.Mesh;
//
//   constructor(private canvas : HTMLCanvasElement) {
//     this._constructWorld();
//
//     // resize scene
//     window.addEventListener('resize', e => {
//       this.engine.resize();
//     });
//   }
//
//   private _constructWorld() {
//     //
//     // engine
//     // The engine is the object interacting with the low-level WebGL API
//     this.engine = new BABYLON.Engine(this.canvas, true);
//     // a container that stores all objects you need to render
//     this.scene = new BABYLON.Scene(this.engine);
//     // this.scene.clearColor = BABYLON.Color3.White();
//
//     //
//     // simulates sun-light (casts light on everything in the scene along its direction)
//     //
//     this.light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 10, 0), this.scene);
//     this.light.diffuse = new BABYLON.Color3(1, 1, 1);
//     this.light.specular = BABYLON.Color3.White();
//     this.light.intensity = .7;
//     // this.light.groundColor = BABYLON.Color3.Black();
//
//     //
//     // ground
//     //
//     let ground = BABYLON.Mesh.CreateGround('grd', 150, 150, 1, this.scene);
// 	  ground.position = new BABYLON.Vector3(0, -200, 0);
//     let groundMat = new BABYLON.StandardMaterial('gmat', this.scene);
//     groundMat.diffuseColor = BABYLON.Color3.Black();
//     // groundMat.diffuseTexture = new BABYLON.Texture('assets/textures/orient.jpg', this.scene);
//     // groundMat.emissiveTexture = new BABYLON.Texture('assets/textures/orient.jpg', this.scene);
// 	  ground.material = groundMat;
//
//     //
//     // head
//     //
//
//     this._head = BABYLON.Mesh.CreateBox('head', 0, this.scene);
//     this._head.isVisible = false;
//
//     let cube = BABYLON.Mesh.CreateCylinder("cylinder", 1, .1, 1, 6, 1, this.scene, false);
//     cube.parent = this._head;
//     cube.position = BABYLON.Vector3.Zero();
//     let cubeMat = new BABYLON.StandardMaterial('cubeMat', this.scene);
//     cubeMat.specularColor = BABYLON.Color3.Blue();
//     cubeMat.diffuseColor = BABYLON.Color3.Red();
//     cubeMat.wireframe = true;
//     cube.material = cubeMat;
//     cube.rotation = new BABYLON.Vector3(0, 0, d2r(-90));
//     // orient right by default
//     // cube.rotate(BABYLON.Axis.Z, -90 * (Math.PI / 180), BABYLON.Space.LOCAL);
//
//
//     //
//     // camera
//     //
//     this.camera = new BABYLON.FreeCamera('FreeCamera', new BABYLON.Vector3(0, 50, 0), this.scene);
//     this.camera.position = new BABYLON.Vector3(0, 5, 0);
//     this.camera.setTarget(BABYLON.Vector3.Zero());
//     this.camera.attachControl(this.canvas, true);
//     // this.camera.rotation.x = 90 * (Math.PI / 180);
//     // (<any>window).cam = this.camera;
//
//     //
//     // render
//     //
//     this.engine.runRenderLoop(() => {
//       let sec = this.engine.getDeltaTime() / 1000;
//       this.observable.onNext(sec);
//       this.scene.render();
//     });
//
//     this.scene.render();
//   }
//
//   public destroy() {
//     this.observable.dispose();
//   }
// }
//
// export = GameWorld;
