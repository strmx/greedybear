/// <reference path='../../typings/interfaces.d.ts'/>

import types = require('../types');
import CanvasElement = require('./CanvasElement');
import Playground = require('../map/Playground');
import PatternHelper = require('../map/PatternHelper');
import Thing = require('../game/Thing');
import CustomMesh = require('./CustomMesh');

const ThingType = types.ThingType;
const V2 = BABYLON.Vector2;
const V3 = BABYLON.Vector3;

class Renderer {
  playground: Playground
  canvas: CanvasElement
  engine: BABYLON.Engine
  scene: BABYLON.Scene
  camera: BABYLON.FollowCamera
  zoomOutCamera: BABYLON.ArcRotateCamera
  scoresPlane: BABYLON.AbstractMesh
  stats: {begin: Function, end: Function, setMode: Function, domElement: HTMLElement}
  shadowGenerator: BABYLON.ShadowGenerator

  constructor(playground: Playground) {
    this.playground = playground;

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
    let light = new BABYLON.HemisphericLight('light1', new V3(0, 1, 0), this.scene);
    // var light = new BABYLON.DirectionalLight('Dir0', new V3(0, -1, 0), this.scene);
    // light.diffuse = new BABYLON.Color3(1, 1, 1);
    // light.specular = new BABYLON.Color3(1, 1, 1);
    light.intensity = 0.7;

    // let h = new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(0, 1, 0), this.scene);
    // h.intensity = 0.5;
    let directLight = new BABYLON.DirectionalLight('dir', new BABYLON.Vector3(2, 5, 3), this.scene);
    // directLight.position = new BABYLON.Vector3(0, 100, 0);


    //
    // CAMERAS
    //

    // let pos = agentOrigin.position;
    // var agentCamera = new BABYLON.FollowCamera('agentCamera', new V3(pos.x, 10, pos.z), this.scene);
    let n = this.playground.map.length;
    let m = this.playground.map[0].length;
    this.camera = new BABYLON.FollowCamera('followCamera', new V3(n / 2, 10, m / 2), this.scene);
    this.camera.radius = 8; // how far from the object to follow
    this.camera.heightOffset = 10; // how high above the object to place the camera
    this.camera.rotationOffset = 270; // the viewing angle
    this.camera.cameraAcceleration = 0.025 // how fast to move
    this.camera.maxCameraSpeed = 2 // speed limit

    this.scene.activeCamera = this.camera;

    this.zoomOutCamera = new BABYLON.ArcRotateCamera("zoomOutCamera", 3 * Math.PI / 2, Math.PI / 8, ((n + m) / 2) * 1.1, new BABYLON.Vector3(n / 2, 0, m / 2), this.scene);
  	this.zoomOutCamera.attachControl(this.canvas.element, true);

    // this.zoomOutCamera = new BABYLON.FreeCamera('zoomOutCamera', new V3(n / 3, Math.min(n, m), m / 3), this.scene);
    // this.zoomOutCamera.setTarget(new V3(n/2, 0, m/2));
    // this.zoomOutCamera.attachControl(this.canvas.element, true);

    //
    // SHADOW
    //

    // // Ground
    // // options: { width: number, height: number, subdivisions: number, minHeight: number, maxHeight: number, buffer: Uint8Array, bufferWidth: number, bufferHeight: number }): VertexData
    // // let ground = BABYLON.VertexData.CreateGroundFromHeightMap({
    // //
    // // });
  	// let ground = BABYLON.Mesh.CreateGroundFromHeightMap('ground', 'textures/heightMap.png', 100, 100, 100, 0, 10, this.scene, false);
  	// let groundMaterial = new BABYLON.StandardMaterial('ground', this.scene);
    // let groundTexture = new BABYLON.Texture('textures/ground.jpg', this.scene);
    // groundTexture.uScale = 16;
    // groundTexture.vScale = 16;
  	// groundMaterial.diffuseTexture = groundTexture;
  	// groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    // ground.position.x = 50;
    // ground.position.z = 50;
  	// ground.material = groundMaterial;
    // ground.receiveShadows = true;


    // this.shadowGenerator = new BABYLON.ShadowGenerator(1024, directLight);
    // // render only once
    // this.shadowGenerator.getShadowMap().refreshRate = 0;
  	// // this.shadowGenerator.usePoissonSampling = true;
    // this.shadowGenerator.useVarianceShadowMap = true;

    //
    // SCORES
    //

    let scoresTexture = new BABYLON.DynamicTexture('scoresPlaneTex', 512, this.scene, true);
    scoresTexture.hasAlpha = true;
    let scoresMat = new BABYLON.StandardMaterial('scoresPlaneMat', this.scene);
    scoresMat.diffuseTexture = scoresTexture;

    this.scoresPlane = BABYLON.Mesh.CreatePlane('ScoresPlane', 1, this.scene);
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

  createEnvironment(playground: Playground) {
    let n = playground.map.length;
    let m = playground.map[0].length;

    // let skyboxMat = new BABYLON.StandardMaterial('skyboxMat', this.scene);
    // skyboxMat.backFaceCulling = false;
    // skyboxMat.reflectionTexture = new BABYLON.CubeTexture('textures/TropicalSunnyDay', this.scene);
    // skyboxMat.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    // skyboxMat.disableLighting = true;
    // let skybox = BABYLON.Mesh.CreateBox('skybox', 1024, this.scene);
    // skybox.material = skyboxMat;


    var skyboxMaterial = new (<any>BABYLON).SkyMaterial("skyMaterial", this.scene);
    skyboxMaterial.backFaceCulling = false;
  	skyboxMaterial._cachedDefines.FOG = true;
    // skyMaterial.turbidity = 1 // 0..20 (maybe 100)
    // skyMaterial.luminance = 1 // 0..1..190
    // skyMaterial.inclination = 0.5; // The solar inclination, related to the solar azimuth in interval [0, 1]
    // skyMaterial.azimuth = 0.25; // The solar azimuth in interval [0, 1]
    // skyMaterial.rayleigh = 2; // Represents the sky appearance (globally) 0..2

    // // Mie scattering (from [Gustav Mie](https://en.wikipedia.org/wiki/Gustav_Mie))
    // Related to the haze particles in atmosphere
    // The amount of haze particles following the Mie scattering theory
    // skyMaterial.mieDirectionalG = 0.8;
    // skyMaterial.mieCoefficient = 0.005; // The mieCoefficient in interval [0, 0.1], affects the property skyMaterial.mieDirectionalG

    var skybox = BABYLON.Mesh.CreateBox("skyBox", 1000.0, this.scene);
    skybox.material = skyboxMaterial;



    //
    // ground
    //

    let buffer = PatternHelper.numberMapToUint8Array(playground.heightMap);
    let ground = CustomMesh.createGroundFromHeightMap('ground', buffer, n, m, n, m, Math.min(n, m), 0, playground.maxHeight, this.scene, false)
    // let ground = BABYLON.Mesh.CreateGroundFromHeightMap(matName, 'textures/heightMap.png', 100, 100, 100, 0, 10, this.scene, false);

    let groundMaterial = new BABYLON.StandardMaterial('ground', this.scene);
    let groundTexture = new BABYLON.Texture('textures/ground.jpg', this.scene);

    groundTexture.uScale = 16;
    groundTexture.vScale = 16;

    groundMaterial.diffuseTexture = groundTexture;
    groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    ground.material = groundMaterial;

    ground.receiveShadows = true;

    ground.position.x = n / 2 - .5;
    ground.position.z = m / 2 - .5;

    // base
    let baseMaterial = new BABYLON.StandardMaterial('ground', this.scene);
    // let baseTexture = new BABYLON.Texture('textures/ground.jpg', this.scene);
    // baseTexture.uScale = 16;
    // baseTexture.vScale = 16;
    // baseMaterial.diffuseTexture = baseTexture;
    // baseMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    baseMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);

    let base = BABYLON.Mesh.CreateBox('base', 1, this.scene);
    base.scaling = new BABYLON.Vector3(n, 1, m);
    base.position.x = n / 2 - .5;
    base.position.y = -(.5 + .1);
    base.position.z = m / 2 - .5;
    base.material = baseMaterial;

    //
    // add water
    //

    /*
    // Water
  	var waterMesh = BABYLON.Mesh.CreateGround("waterMesh", 1024, 1024, 1, this.scene, false);
  	var water = new (<any>BABYLON).WaterMaterial("water", this.scene);
    // waterMesh.position.y = -1.7;
    waterMesh.position.y = -250;
  	water.bumpTexture = new BABYLON.Texture("textures/waterbump.png", this.scene);

  	// Water properties
  	water.windForce = 1;
  	water.waveHeight = .3;
  	water.windDirection = new BABYLON.Vector2(1, 1);
  	water.waterColor = new BABYLON.Color3(0.1, 0.1, 0.4);
  	water.colorBlendFactor = 0;
  	water.bumpHeight = 0.1;
  	water.waveLength = 1;

  	// Add skybox and ground to the reflection and refraction
  	water.addToRenderList(skybox);
  //	water.addToRenderList(ground);

  	// Assign the water material
  	waterMesh.material = water;
    */
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

      if (thing) {
        console.warn('TBD: remove me');
        return;
      }

      if (!mat) {
        mat = new BABYLON.StandardMaterial(matName, this.scene);
        // (<BABYLON.StandardMaterial>mat).diffuseColor = BABYLON.Color3.Black();
        (<BABYLON.StandardMaterial>mat).diffuseTexture = new BABYLON.Texture('textures/ground.jpg', this.scene);
        // (<BABYLON.StandardMaterial>mat).specularColor = BABYLON.Color3.Black();
        // (<BABYLON.StandardMaterial>mat).emissiveColor = BABYLON.Color3.White();
      }

      if (!mesh) {
        mesh = BABYLON.Mesh.CreatePlane(meshName, 1, this.scene, false, BABYLON.Mesh.FRONTSIDE);
        mesh.material = mat;
        mesh.isVisible = false;
      }

      mesh = (<BABYLON.Mesh>mesh).createInstance('' + thing.id);
      mesh.receiveShadows = true;
      // mesh.scaling.multiplyInPlace(new BABYLON.Vector3(.5, .5, .5));
      break;

      //
      // WALL
      //
      case ThingType.WALL:

      if (!mat) {
        mat = new BABYLON.StandardMaterial(matName, this.scene);
        // (<BABYLON.StandardMaterial>mat).diffuseColor = BABYLON.Color3.White();
        (<BABYLON.StandardMaterial>mat).diffuseColor = new BABYLON.Color3(.5, .75, .25);
        (<BABYLON.StandardMaterial>mat).specularColor = BABYLON.Color3.White();
      }

      if (!mesh) {
        mesh = CustomMesh.createPyramid(meshName, 1, 1, this.scene);
        // mesh = BABYLON.Mesh.CreateBox(meshName, 1, this.scene, false, BABYLON.Mesh.FRONTSIDE);
        mesh.material = mat;
        mesh.isVisible = false;
      }

      mesh = (<BABYLON.Mesh>mesh).createInstance('' + thing.id);
      // this.shadowGenerator.getShadowMap().renderList.push(mesh);
      // mesh.scaling.multiplyInPlace(new BABYLON.Vector3(.5, .5, .5));
      break;

      //
      // COMPANION
      //
      case ThingType.COMPANION:

      if (!mat) {
        mat = new BABYLON.StandardMaterial(matName, this.scene);
        (<BABYLON.StandardMaterial>mat).diffuseColor = BABYLON.Color3.Red();
        // Fresnel
        // (<BABYLON.StandardMaterial>mat).emissiveFresnelParameters = new BABYLON.FresnelParameters();
        // (<BABYLON.StandardMaterial>mat).emissiveFresnelParameters.bias = 0.4;
        // (<BABYLON.StandardMaterial>mat).emissiveFresnelParameters.power = 2;
        // (<BABYLON.StandardMaterial>mat).emissiveFresnelParameters.leftColor = BABYLON.Color3.Black();
        // (<BABYLON.StandardMaterial>mat).emissiveFresnelParameters.rightColor = BABYLON.Color3.White();
      }

      if (!mesh) {
        mesh = BABYLON.Mesh.CreateSphere(meshName, 4, 1, this.scene, false, BABYLON.Mesh.FRONTSIDE);
        // mesh.position.y = .5;
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
        // mesh.position.y = .5;
        mesh.material = mat;
        mesh.isVisible = false;
      }

      mesh = (<BABYLON.Mesh>mesh).createInstance('' + thing.id);

      // adjust follow camera
      this.camera.target = mesh;

      break;

      default:
        debugger;
    }

    if (!mesh || !mat) {
      debugger;
    }

    mesh.position = thing.position;
    mesh.rotation = thing.rotation;
    mesh.scaling = thing.scaling;
  }

  destroy() {
    throw 'TBD';
  }

  render() {
    throw 'TBD';
  }
}

export = Renderer;
