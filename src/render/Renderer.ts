/// <reference path="../../typings/interfaces.d.ts"/>

import CanvasElement = require('./CanvasElement');
import Thing = require('../game/Thing');
import types = require('../types');

const ThingType = types.ThingType;
const V2 = BABYLON.Vector2;
const V3 = BABYLON.Vector3;

const ANGLE_RIGHT = 0;
const ANGLE_BOTTOM = 1.5707963267948966;
const ANGLE_LEFT = 3.141592653589793;
const ANGLE_TOP = -1.5707963267948966;

class Renderer {
  canvas: CanvasElement;
  engine: BABYLON.Engine;
  scene: BABYLON.Scene;
  camera: BABYLON.FollowCamera;
  zoomOutCamera: BABYLON.FreeCamera;
  scoresPlane: BABYLON.AbstractMesh;
  stats: {begin: Function, end: Function, setMode: Function, domElement: HTMLElement};

  constructor() {

    // this.engine.runRenderLoop(() => {
    //   stats.begin();
    //
    //   let delta = this.engine.getDeltaTime();
    //   let distance = (delta * speed) / 1000;
    //   distanceFromCell += distance;
    //   shiftAgent();
    //
    //   this.scene.render();
    //   stats.end();
    // });


    this.canvas = new CanvasElement(document.body);
    this.canvas.resize();

    this.engine = new BABYLON.Engine(this.canvas.element, true, {}, true);
    this.scene = new BABYLON.Scene(this.engine);

    //
    // show debug information
    //
    (<any>window).dm = () => {
      if (this.scene.debugLayer.isVisible())
        this.scene.debugLayer.hide();
      else
        this.scene.debugLayer.show();
    };

    // this.engine.resize();

    //
    // stats
    //
    this.stats = new Stats();
    this.stats.setMode(0);
    this.stats.domElement.style.cssText='position:fixed;left:0;top:0;z-index:10000';
    document.body.appendChild(this.stats.domElement);

    //
    // LIGHT
    //

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    let light = new BABYLON.HemisphericLight("light1", new V3(0, 10, 0), this.scene);
    // var light = new BABYLON.DirectionalLight("Dir0", new V3(0, -1, 0), this.scene);
    // light.diffuse = new BABYLON.Color3(1, 1, 1);
    // light.specular = new BABYLON.Color3(1, 1, 1);

    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;

    //
    // CAMERAS
    //

    // let pos = agentOrigin.position;
    // var agentCamera = new BABYLON.FollowCamera("agentCamera", new V3(pos.x, 10, pos.z), this.scene);
    let n = 100;
    let m = 100;
    this.camera = new BABYLON.FollowCamera("this.camera", new V3(n / 2, 10, m / 2), this.scene);
    this.camera.radius = 8; // how far from the object to follow
    this.camera.heightOffset = 10; // how high above the object to place the camera
    this.camera.rotationOffset = 270; // the viewing angle
    this.camera.cameraAcceleration = 0.025 // how fast to move
    this.camera.maxCameraSpeed = 2 // speed limit

    this.scene.activeCamera = this.camera;


    this.zoomOutCamera = new BABYLON.FreeCamera("zoomOutCamera", new V3(n / 2, Math.min(n, m), m / 2), this.scene);
    this.zoomOutCamera.setTarget(new V3(n/2, 0, m/2));

    //
    // SCORES
    //

    let scoresTexture = new BABYLON.DynamicTexture("scoresPlaneTex", 512, this.scene, true);
    scoresTexture.hasAlpha = true;
    let scoresMat = new BABYLON.StandardMaterial("scoresPlaneMat", this.scene);
    scoresMat.diffuseTexture = scoresTexture;

    this.scoresPlane = BABYLON.Mesh.CreatePlane("ScoresPlane", 1, this.scene);
    this.scoresPlane.material = scoresMat;

    this.scoresPlane.position.z = 8;
    this.scoresPlane.position.y = 2.75;
    this.scoresPlane.parent = this.camera;
  }

  switchCameras() {
    this.scene.activeCamera = this.scene.activeCamera !== this.camera ? this.camera : this.zoomOutCamera;
  }

  updateScoresText(scores) {
    let scoresMat = <BABYLON.StandardMaterial>this.scoresPlane.material;
    let scoresTexture = <BABYLON.DynamicTexture>scoresMat.diffuseTexture;
    scoresTexture.getContext().clearRect(0, 0, 512, 512);
    scoresTexture.drawText(scores, null, 350, '256px bold Verdana', '#fff', 'transparent');
  }

  showThing(thing: Thing) {
    let meshName = 'M' + thing.type;
    let matName = 'm' + thing.type;
    let mesh = this.scene.getMeshByName(meshName);
    let mat = this.scene.getMaterialByName(matName);

    switch(thing.type) {
      //
      // GROUND
      //
      case ThingType.GROUND:

      if (!mat) {
        mat = new BABYLON.StandardMaterial(matName, this.scene);
        // mat.diffuseColor = BABYLON.Color3.White();
        // (<BABYLON.StandardMaterial>mat).diffuseTexture = new BABYLON.Texture("textures/grass.jpg", this.scene);
        (<BABYLON.StandardMaterial>mat).specularColor = BABYLON.Color3.Black();
        (<BABYLON.StandardMaterial>mat).emissiveColor = BABYLON.Color3.White();
      }

      if (!mesh) {
        mesh = BABYLON.Mesh.CreatePlane(meshName, 1, this.scene, false, BABYLON.Mesh.FRONTSIDE);
        mesh.material = mat;
        mesh.isVisible = false;
      }

      mesh = (<BABYLON.Mesh>mesh).createInstance('' + thing.id);
      break;

      //
      // WALL
      //
      case ThingType.WALL:

      if (!mat) {
        mat = new BABYLON.StandardMaterial(matName, this.scene);
        (<BABYLON.StandardMaterial>mat).diffuseColor = BABYLON.Color3.Black();
        (<BABYLON.StandardMaterial>mat).specularColor = BABYLON.Color3.White();
      }

      if (!mesh) {
        mesh = BABYLON.Mesh.CreateBox(meshName, 1, this.scene, false, BABYLON.Mesh.FRONTSIDE);
        mesh.material = mat;
        mesh.isVisible = false;
      }

      mesh = (<BABYLON.Mesh>mesh).createInstance('' + thing.id);
      break;

      //
      // COMPANION
      //
      case ThingType.COMPANION:

      if (!mat) {
        mat = new BABYLON.StandardMaterial(matName, this.scene);
        (<BABYLON.StandardMaterial>mat).diffuseColor = BABYLON.Color3.Red();
        // Fresnel
        (<BABYLON.StandardMaterial>mat).emissiveFresnelParameters = new BABYLON.FresnelParameters();
        (<BABYLON.StandardMaterial>mat).emissiveFresnelParameters.bias = 0.4;
        (<BABYLON.StandardMaterial>mat).emissiveFresnelParameters.power = 2;
        (<BABYLON.StandardMaterial>mat).emissiveFresnelParameters.leftColor = BABYLON.Color3.Black();
        (<BABYLON.StandardMaterial>mat).emissiveFresnelParameters.rightColor = BABYLON.Color3.White();
      }

      if (!mesh) {
        mesh = BABYLON.Mesh.CreateSphere(meshName, 4, 1, this.scene, false, BABYLON.Mesh.FRONTSIDE);
        mesh.position.y = .5;
        mesh.material = mat;
        mesh.isVisible = false;
      }

      mesh = (<BABYLON.Mesh>mesh).createInstance('' + thing.id);
      break;

      //
      // AGENT
      //
      case ThingType.AGENT:

      if (!mat) {
        mat = new BABYLON.StandardMaterial(matName, this.scene);
        (<BABYLON.StandardMaterial>mat).diffuseColor = BABYLON.Color3.Green();
      }

      if (!mesh) {
        mesh = BABYLON.Mesh.CreateSphere(meshName, 8, 1, this.scene, false, BABYLON.Mesh.FRONTSIDE);
        mesh.position.y = .5;
        mesh.material = mat;
        mesh.isVisible = false;
      }

      mesh = (<BABYLON.Mesh>mesh).createInstance('' + thing.id);

      // adjust follow camera
      this.camera.target = mesh;

      break;

      //
      // SKY
      //
      case ThingType.SKY:
        if (mesh || mat) {
          debugger;
        }

        // mat
        mat = new BABYLON.StandardMaterial(matName, this.scene);
        mat.backFaceCulling = false;
        (<BABYLON.StandardMaterial>mat).reflectionTexture = new BABYLON.CubeTexture('textures/TropicalSunnyDay', this.scene);
        (<BABYLON.StandardMaterial>mat).reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        (<BABYLON.StandardMaterial>mat).diffuseColor = new BABYLON.Color3(0, 0, 0);
        (<BABYLON.StandardMaterial>mat).specularColor = new BABYLON.Color3(0, 0, 0);
        (<BABYLON.StandardMaterial>mat).disableLighting = true;

        // mesh
        mesh = BABYLON.Mesh.CreateBox(meshName, 500.0, this.scene);
        mesh.material = mat;
        break;

      default:
        debugger;
    }

    if (!mesh || !mat) {
      debugger;
    }

    mesh.position = thing.position;
    mesh.rotation = thing.rotation;

  }

  destroy() {
    throw 'TBD';
  }

  render() {
    throw 'TBD';
  }
}

export = Renderer;
