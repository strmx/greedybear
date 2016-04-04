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

const SKY_SIZE = 1000;

class Renderer {
  playground: Playground
  canvas: CanvasElement
  engine: BABYLON.Engine
  scene: BABYLON.Scene
  camera: BABYLON.FollowCamera
  zoomOutCamera: BABYLON.ArcRotateCamera

  surface: BABYLON.AbstractMesh;

  scoresPlane: BABYLON.AbstractMesh
  shadowGenerator: BABYLON.ShadowGenerator

  hiveCollisionParticleSystem: BABYLON.ParticleSystem
  hiveCollisionParticleAnimation: BABYLON.Animation
  hiveCollisionAnimation: BABYLON.Animation

  constructor(playground: Playground) {
    this.playground = playground;

    const nextReal = (<any>window).nextReal;
    const n = this.playground.map.length;
    const m = this.playground.map[0].length;

    this.canvas = new CanvasElement(document.body);
    // this.canvas.resize();




    this.engine = new BABYLON.Engine(this.canvas.element, true, {}, true);
    this.scene = new BABYLON.Scene(this.engine);

    // [1 - 4] (.5 for retina etc)
    // TODO: make autoadjusted
    this.setScreenScale(1);

    (<any>window).addEventListener('resize', () => {
      this.engine.resize();
      // refreshTextureRatios();
    });

    //
    // LIGHT
    //

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    // let light = new BABYLON.HemisphericLight('light1', new V3(n, 50, m), this.scene);
    // var light = new BABYLON.DirectionalLight('Dir0', new V3(0, -1, 0), this.scene);
    // light.diffuse = new BABYLON.Color3(1, 1, 1);
    // light.specular = new BABYLON.Color3(1, 1, 1);
    // light.intensity = 1; // .7

    let h = new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(0, 1, 0), this.scene);
    h.intensity = 1.25;
    // let directLight = new BABYLON.DirectionalLight('dir', new BABYLON.Vector3(2, 5, 3), this.scene);
    // directLight.position = new BABYLON.Vector3(0, 50, 0);
    // directLight.intensity = 1;

    // var pl = new BABYLON.PointLight('pl', new BABYLON.Vector3(0, 50, 0), this.scene);
    // pl.diffuse = new BABYLON.Color3(1, 1, 1);
    // pl.specular = new BABYLON.Color3(1, 1, 1);
    // pl.intensity = .6; // .8

    //
    // CAMERAS
    //

    // let pos = agentOrigin.position;
    // var agentCamera = new BABYLON.FollowCamera('agentCamera', new V3(pos.x, 10, pos.z), this.scene);
    this.camera = new BABYLON.FollowCamera('followCamera', new V3(n / 2, 10, m / 2), this.scene);
    this.camera.radius = 5; // how far from the object to follow
    this.camera.heightOffset = 7; // how high above the object to place the camera
    // this.camera.rotationOffset = 270; // the viewing angle
    this.camera.cameraAcceleration = 0.01 // how fast to move
    this.camera.maxCameraSpeed = .5 // speed limit

    // this.scene.activeCamera = this.camera;

    this.zoomOutCamera = new BABYLON.ArcRotateCamera('zoomOutCamera', 3 * Math.PI / 2, Math.PI / 8, ((n + m) / 2) * 1.1, new BABYLON.Vector3(n / 2, 0, m / 2), this.scene);
  	this.zoomOutCamera.attachControl(this.canvas.element, true);
    this.zoomOutCamera.lowerBetaLimit = .2;
    this.zoomOutCamera.upperBetaLimit = (Math.PI * 2) / 5;
    this.zoomOutCamera.alpha = nextReal() * (Math.PI * 2);
    this.zoomOutCamera.beta = 1.1;

    this.zoomOutCamera.lowerRadiusLimit = 20;
    this.zoomOutCamera.upperRadiusLimit = 100;
    this.zoomOutCamera.radius = 60 + nextReal() * (100 - 60);

    this.scene.activeCamera = this.zoomOutCamera;

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

    this.scoresPlane.position.z = 7.5;
    this.scoresPlane.position.y = 2.75;
    this.scoresPlane.parent = this.camera;

    //
    // the fog
    //

    // this.scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
    // this.scene.fogDensity = 30;
    // this.scene.fogColor = new BABYLON.Color3(0.8, 0.83, 0.8);

    this._createEnvironment(playground);

    /*
      PREPARE HIVE COLLISION ANIMATION
     */

    // Create a particle system
    this.hiveCollisionParticleSystem = new BABYLON.ParticleSystem('part1', 250, this.scene);
    this.hiveCollisionParticleSystem.particleTexture = new BABYLON.Texture('textures/bee-particle.png', this.scene);
    this.hiveCollisionParticleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;

    this.hiveCollisionParticleSystem.minAngularSpeed = 0;
    this.hiveCollisionParticleSystem.maxAngularSpeed = Math.PI * 2;

    // this.hiveCollisionParticleSystem.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
    // this.hiveCollisionParticleSystem.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
    // this.hiveCollisionParticleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);
    this.hiveCollisionParticleSystem.colorDead = new BABYLON.Color4(1, 1, 0, 0.0);
    this.hiveCollisionParticleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);

    this.hiveCollisionParticleSystem.emitter = this.scene;
    this.hiveCollisionParticleSystem.minSize = 0.15;
    this.hiveCollisionParticleSystem.maxSize = .25;
    this.hiveCollisionParticleSystem.minLifeTime = 0.25;
    this.hiveCollisionParticleSystem.maxLifeTime = .5;
    //    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    this.hiveCollisionParticleSystem.direction1 = new BABYLON.Vector3(-1, 20, 1);
    this.hiveCollisionParticleSystem.direction2 = new BABYLON.Vector3(1, 10, -1);
    // Speed
    this.hiveCollisionParticleSystem.minEmitPower = 1;
    this.hiveCollisionParticleSystem.maxEmitPower = 3;
    this.hiveCollisionParticleSystem.updateSpeed = 0.0075;
    this.hiveCollisionParticleSystem.emitRate = 0;

    this.hiveCollisionParticleSystem.start();

    this.hiveCollisionParticleAnimation = new BABYLON.Animation('part1ani', 'emitRate', 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    this.hiveCollisionParticleAnimation.setKeys([{
        frame: 0,
        value: 0
      }, {
        frame: 4,
        value: 0
      }, {
        frame: 5,
        value: 128
      }, {
        frame: 15,
        value: 0
      }, {
        frame: 30,
        value: 0
      }]
    );
    this.hiveCollisionParticleSystem.animations.push(this.hiveCollisionParticleAnimation);

    this.hiveCollisionAnimation = new BABYLON.Animation('part2ani', 'scaling', 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    this.hiveCollisionAnimation.setKeys([{
        frame: 0,
        value: new BABYLON.Vector3(1, 1, 1)
      }, {
        frame: 5,
        value: new BABYLON.Vector3(1, 1, 1)
      }, {
        frame: 30,
        value: new BABYLON.Vector3(0, 0, 0)
      }]
    );
  }

  /*
  1 = 1px = devicePixelRatio
  [(1/devicePixelRatio)..4]
  */
  setScreenScale(level) {
    this.engine.setHardwareScalingLevel(level);
  }

  switchCameras() {
    this.scene.activeCamera = this.scene.activeCamera !== this.camera ? this.camera : this.zoomOutCamera;
  }

  zoomOut() {
    this.scene.activeCamera = this.zoomOutCamera;
  }

  zoomIn() {
    // this.camera.radius = this.zoomOutCamera.radius;
    this.scene.activeCamera = this.camera;

    var i = window.setInterval(() => {
      let readyCount = 0;

      if (this.camera.rotationOffset < 270) {
        this.camera.rotationOffset += 20;
      } else {
        this.camera.rotationOffset = 270;
        readyCount = readyCount | 1;
      }

      // TODO: animate radius from zoomOutCam
      // if (this.camera.radius > 5) {
      //   this.camera.radius -= 10;
      // } else {
      //   this.camera.radius = 5;
      //   readyCount = readyCount | 2;
      //   console.log(2, readyCount);
      // }

      if (readyCount >= 1) {
        window.clearInterval(i);
      }
    }, 32);
  }

  updateScoresText(scores) {
    document.querySelector('.scores strong').textContent = scores;

    // let scoresMat = <BABYLON.StandardMaterial>this.scoresPlane.material;
    // let scoresTexture = <BABYLON.DynamicTexture>scoresMat.diffuseTexture;
    // let ctx = scoresTexture.getContext();
    // ctx.clearRect(0, 0, 512, 512);
    // scoresTexture.drawText(scores, null, 245, '220px fantasy', '#000', 'transparent');
    // scoresTexture.drawText(scores, null, 250, '200px fantasy', '#fff', 'transparent');
  }

  private _createEnvironment(playground: Playground) {
    const nextReal = (<any>window).nextReal;

    let n = playground.map.length;
    let m = playground.map[0].length;

    let skyboxMaterial = new BABYLON.StandardMaterial('skyboxMaterial', this.scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture('textures/skybox/skybox', this.scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.disableLighting = true;
    // let skybox = BABYLON.Mesh.CreateBox('skybox', 1024, this.scene);
    // skybox.material = skyboxMat;


    // var skyboxMaterial = new (<any>BABYLON).SkyMaterial('skyMaterial', this.scene);
    // skyboxMaterial.backFaceCulling = false;
    //
  	// // skyboxMaterial._cachedDefines.FOG = nextReal() > .5;
    // skyboxMaterial.turbidity = nextReal() * 2; // 0..20 (maybe 100)
    // skyboxMaterial.luminance = .5 + nextReal() * .5; // 0..1..190
    // skyboxMaterial.inclination = .5 + nextReal() * .25; // The solar inclination, related to the solar azimuth in interval [0, 1]
    // skyboxMaterial.azimuth = 0.5 + nextReal() * .05; // The solar azimuth in interval [0, 1]
    // console.log(skyboxMaterial);
    // skyboxMaterial.rayleigh = nextReal() * 2; // Represents the sky appearance (globally) 0..2

    // // Mie scattering (from [Gustav Mie](https://en.wikipedia.org/wiki/Gustav_Mie))
    // Related to the haze particles in atmosphere
    // The amount of haze particles following the Mie scattering theory
    // skyboxMaterial.mieDirectionalG = nextReal(); // 0.8
    // skyboxMaterial.mieCoefficient = nextReal() * .1; // The mieCoefficient in interval [0, 0.1], affects the property skyMaterial.mieDirectionalG

    /*
    case 49: setSkyConfig("material.inclination", skyboxMaterial.inclination, 0); break; // 1
    case 50: setSkyConfig("material.inclination", skyboxMaterial.inclination, -0.5); break; // 2

    case 51: setSkyConfig("material.luminance", skyboxMaterial.luminance, 0.1); break; // 3
    case 52: setSkyConfig("material.luminance", skyboxMaterial.luminance, 1.0); break; // 4

    case 53: setSkyConfig("material.turbidity", skyboxMaterial.turbidity, 40); break; // 5
    case 54: setSkyConfig("material.turbidity", skyboxMaterial.turbidity, 5); break; // 6
     */


    var skybox = BABYLON.Mesh.CreateBox('skyBox', SKY_SIZE, this.scene, false);
    skybox.material = skyboxMaterial;
    skybox.position.y = SKY_SIZE / 4;



    //
    // ground
    //

    let buffer = PatternHelper.numberMapToUint8Array(playground.heightMap);
    let ground = CustomMesh.createGroundFromHeightMap('ground', buffer, n, m, n, m, Math.round((n + m) / 2), 0, playground.maxHeight, this.scene, false);
    this.surface = ground;
    // let ground = BABYLON.Mesh.CreateGroundFromHeightMap(matName, 'textures/heightMap.png', 100, 100, 100, 0, 10, this.scene, false);
    // polygon.convertToFlatShadedMesh();

    // let intersectionPos = new BABYLON.Vector3(10, 0, 10);
    // let rayPick = new BABYLON.Ray(intersectionPos, new BABYLON.Vector3(0, 1, 0));
    // let pickInfo = ground.intersects(rayPick);
    // console.log(pickInfo);
    // if (pickInfo) {
    //   pickInfo.pickedPoint.y;
    // }

    let groundMaterial = new BABYLON.StandardMaterial('ground', this.scene);
    let groundTexture = new BABYLON.Texture('textures/tile-grass-3.png', this.scene);
    groundTexture.uScale = n;
    groundTexture.vScale = m;
    groundMaterial.diffuseTexture = groundTexture;

    // groundMaterial.diffuseColor = new BABYLON.Color3(.4, .6, .1);
    groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    ground.material = groundMaterial;

    ground.receiveShadows = true;

    ground.position.x = n / 2 - .5;
    ground.position.z = m / 2 - .5;


    // ocean




    // base
    // 355117
    // groundMaterial.diffuseColor = new BABYLON.Color3(.4, .6, .1);
    let baseMaterial = new BABYLON.StandardMaterial('ground', this.scene);
    // let baseTexture = new BABYLON.Texture('textures/ground.jpg', this.scene);
    // baseTexture.uScale = 16;
    // baseTexture.vScale = 16;
    // baseMaterial.diffuseTexture = baseTexture;
    // baseMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    baseMaterial.diffuseColor = new BABYLON.Color3(.4666, .5333, .2);
    baseMaterial.specularColor = new BABYLON.Color3(0, 0, 0);

    let base = BABYLON.Mesh.CreateBox('base', 1, this.scene);
    base.scaling = new BABYLON.Vector3(n, 2, m);
    base.position.x = n / 2 - .5;
    base.position.y = -(1 + .01);
    base.position.z = m / 2 - .5;
    base.material = baseMaterial;


    let base2Mat = new BABYLON.StandardMaterial('base2Mat', this.scene);
    base2Mat.diffuseColor = new BABYLON.Color3(1, .75, .5);
    base2Mat.specularColor = new BABYLON.Color3(0, 0, 0);
    let base2 = BABYLON.Mesh.CreateBox('base2', 1, this.scene);
    base2.scaling = new BABYLON.Vector3(n, 2, m);
    base2.position.x = n / 2 - .5;
    base2.position.y = -(1 + .001) - 2;
    base2.position.z = m / 2 - .5;
    base2.material = base2Mat;

    let base3Mat = new BABYLON.StandardMaterial('base3Mat', this.scene);
    base3Mat.diffuseColor = new BABYLON.Color3(.4666, .5333, .2);
    base3Mat.specularColor = new BABYLON.Color3(0, 0, 0);
    let base3 = BABYLON.Mesh.CreateBox('base3', 1, this.scene);
    base3.scaling = new BABYLON.Vector3(n, 2, m);
    base3.position.x = n / 2 - .5;
    base3.position.y = -(1 + .01) - 4;
    base3.position.z = m / 2 - .5;
    base3.material = base3Mat;

    //
    // add lakes
    //

    let lakeMat = new BABYLON.StandardMaterial('lake', this.scene);
    let lakeTex = new BABYLON.Texture('textures/tile-water-3.png', this.scene);
    lakeMat.diffuseTexture = lakeTex;
    lakeMat.specularColor = new BABYLON.Color3(.25, .25, .25);
    // lakeMat.diffuseColor = new BABYLON.Color3(.1, .25, .5);

    playground.lakes.forEach((lake: LakeArea, i) => {
      let lakeMesh = CustomMesh.createLake(lake, 'lake' + i, this.scene);
      lakeMesh.position.y = lake.y;
      lakeMesh.material = lakeMat;
      lakeMesh.alphaIndex = .1;
    });


    //
    // add water
    //

    // let waterMat = new BABYLON.StandardMaterial('waterMat', this.scene);
    // let waterTex = new BABYLON.Texture('textures/tile-water-3.png', this.scene);
    // waterTex.uScale = SKY_SIZE;
    // waterTex.vScale = SKY_SIZE;
    // waterMat.diffuseTexture = waterTex;
    // let water = BABYLON.Mesh.CreatePlane('water', SKY_SIZE, this.scene, false, BABYLON.Mesh.FRONTSIDE);
    // water.material = waterMat;
    // water.rotation.x = Math.PI / 2;
    // water.position.y = -4;



    // Waves Water
  // 	var waterMesh = BABYLON.Mesh.CreateGround('waterMesh', SKY_SIZE, SKY_SIZE, 1, this.scene, false);
  // 	var water = new (<any>BABYLON).WaterMaterial('water', this.scene);
  //   waterMesh.position.y = -1.7;
  //   // waterMesh.position.y = -250;
  // 	water.bumpTexture = new BABYLON.Texture('textures/waterbump.png', this.scene);
  //
  // 	// Water properties
  // 	water.windForce = 1;
  // 	water.waveHeight = .3;
  // 	water.windDirection = new BABYLON.Vector2(1, 1);
  // 	water.waterColor = new BABYLON.Color3(0.1, 0.1, 0.4);
  // 	water.colorBlendFactor = 0;
  // 	water.bumpHeight = 0.1;
  // 	water.waveLength = 1;
  //
  // 	// Add skybox and ground to the reflection and refraction
  // 	water.addToRenderList(skybox);
  // //	water.addToRenderList(ground);
  //
  // 	// Assign the water material
  // 	waterMesh.material = water;
  }


  removeThingView(thing: Thing) {
    // remove old mesh
    let mesh = this.scene.getMeshByName('' + thing.id);
    if (mesh) {
      this.scene.removeMesh(mesh);
    }
  }

  addThingView(thing: Thing) {
    const nextReal = (<any>window).nextReal;

    let meshName = 'M' + thing.type;
    let matName = 'm' + thing.type;
    let mesh = this.scene.getMeshByName(meshName);
    let mat = this.scene.getMaterialByName(matName);


    let testMat: BABYLON.Material = this.scene.getMaterialByName('testMat');
    if (!testMat) {
      testMat = new BABYLON.StandardMaterial('testMat', this.scene);
      let testTex = new BABYLON.Texture('textures/UVTextureChecker512.png', this.scene);
      (<BABYLON.StandardMaterial>testMat).diffuseTexture = testTex;
    }

    switch(thing.type) {

      //
      // TREE
      //

      case ThingType.TREE:

      if (!mesh) {
        if (!mat) {
          let firMat = new BABYLON.StandardMaterial(matName, this.scene);
          console.info('+', matName, firMat);

          // TODO: make specular as autoadjustment option
          // firMat.specularColor = new BABYLON.Color3(.5, .5, .25);
          firMat.specularColor = BABYLON.Color3.Black();

          let firTex = new BABYLON.Texture('textures/tile-tree-3.png', this.scene);
          firTex.uScale = -1;
          firTex.vScale = -1;

          firMat.diffuseTexture = firTex;
          mat = firMat;
        }

        console.info('+', meshName);
        mesh = CustomMesh.createTree(meshName, this.scene);
        mesh.material = mat;
        mesh.isVisible = false;
      }

      mesh = (<BABYLON.Mesh>mesh).createInstance('' + thing.id);

      // this.shadowGenerator.getShadowMap().renderList.push(mesh);
      // mesh.scaling.multiplyInPlace(new BABYLON.Vector3(.5, .5, .5));

      mesh.position = thing.position;
      mesh.rotation = thing.rotation;
      mesh.scaling = thing.scaling;

      break;

      //
      // FIR
      //

      case ThingType.FIR:

      if (!mesh) {
        if (!mat) {
          console.info('+', matName);
          let firMat = new BABYLON.StandardMaterial(matName, this.scene);

          // TODO: make specular as autoadjustment option
          // firMat.specularColor = new BABYLON.Color3(.5, .5, .25);
          firMat.specularColor = BABYLON.Color3.Black();

          let firTex = new BABYLON.Texture('textures/tile-fir-0.png', this.scene);
          firTex.uScale = .2;
          CustomMesh.normalizePyramidTexture(firTex);
          firMat.diffuseTexture = firTex;
          mat = firMat;
        }

        console.info('+', meshName);
        mesh = CustomMesh.createPyramid(meshName, this.scene);
        mesh.material = mat;
        mesh.isVisible = false;
      }

      mesh = (<BABYLON.Mesh>mesh).createInstance('' + thing.id);

      // this.shadowGenerator.getShadowMap().renderList.push(mesh);
      // mesh.scaling.multiplyInPlace(new BABYLON.Vector3(.5, .5, .5));

      mesh.position = thing.position;
      mesh.rotation = thing.rotation;
      mesh.scaling = thing.scaling;

      break;

      //
      // Mountain
      //

      case ThingType.MOUNTAIN:

      if (!mesh) {
        if (!mat) {
          console.info('+', matName);
          let mountainMat = new BABYLON.StandardMaterial(matName, this.scene);

          // mountainMat.specularColor = new BABYLON.Color3(.5, .5, .25);
          mountainMat.specularColor = BABYLON.Color3.Black();

          let mountainTex = new BABYLON.Texture('textures/tile-mountains-0.png', this.scene);
          CustomMesh.normalizePyramidTexture(mountainTex);
          mountainMat.diffuseTexture = mountainTex;
          mat = mountainMat;
        }

        console.info('+', meshName);
        mesh = CustomMesh.createPyramid(meshName, this.scene);
        mesh.material = mat;
        mesh.isVisible = false;
      }

      mesh = (<BABYLON.Mesh>mesh).createInstance('' + thing.id);
      // this.shadowGenerator.getShadowMap().renderList.push(mesh);

      mesh.position = thing.position;
      mesh.rotation = thing.rotation;
      mesh.scaling = thing.scaling;

      break;

      //
      // HIVE
      //

      case ThingType.HIVE:

      if (!mesh) {
        if (!mat) {
          console.info('+', matName);
          let hiveMat = new BABYLON.StandardMaterial(matName, this.scene);

          // mountainMat.specularColor = new BABYLON.Color3(.5, .5, .25);
          hiveMat.specularColor = BABYLON.Color3.Black();

          let hiveTex = new BABYLON.Texture('textures/hive.png', this.scene);
          hiveTex.vScale = -1;
          hiveTex.uScale = -1;
          hiveMat.diffuseTexture = hiveTex;
          mat = hiveMat;
        }

        let sphere = BABYLON.Mesh.CreateSphere(meshName, 4, .6, this.scene);
        // sphere.convertToFlatShadedMesh();
    	  sphere.scaling.x = sphere.scaling.z = .75;
        sphere.position.y = .375 - .25;

        mesh = BABYLON.Mesh.MergeMeshes([sphere]);
        mesh.name = meshName;
        mesh.material = mat;
        mesh.isVisible = false;
      }

      mesh = (<BABYLON.Mesh>mesh).createInstance('' + thing.id);

      mesh.rotation.y = (360 * nextReal()) * (Math.PI / 180);
      mesh.rotation.x = (nextReal() * 45 - 22.5) * (Math.PI / 180);
      mesh.rotation.y = (nextReal() * 45 - 22.5) * (Math.PI / 180);

      mesh.position = thing.position;
      // ignore thing rotation
      // mesh.rotation = thing.rotation;
      mesh.scaling = thing.scaling;

      // this.shadowGenerator.getShadowMap().renderList.push(mesh);
      break;

      //
      // BEE
      //
      case ThingType.BEE:

      if (!mesh) {

      	//
      	// body
      	//

      	let beeBody = BABYLON.Mesh.CreateBox('beeBody', 1, this.scene);
      	beeBody.scaling.x = .2;
      	beeBody.scaling.y = .2;
      	beeBody.scaling.z = .3;
        beeBody.position.x = -.1;
        beeBody.position.y = .75;
        beeBody.rotation.y = Math.PI / 2;

        let beeBodyMat = new BABYLON.StandardMaterial('beeBodyMat', this.scene);
        let beeBodyTex = new BABYLON.Texture('textures/bee-body-0.png', this.scene);
        let rotatedBeeBodyTex = beeBodyTex.clone();
        rotatedBeeBodyTex.wAng = Math.PI / 2;
        rotatedBeeBodyTex.vScale = -1;
        let beeBodyBackTex = new BABYLON.Texture('textures/bee-body-back-0.png', this.scene);
      	beeBodyMat.specularColor = new BABYLON.Color3(0, 0, 0);
        beeBodyMat.diffuseTexture = beeBodyTex;

        //Define a material
        let backMat = new BABYLON.StandardMaterial('beeBodyMat1', this.scene);
        backMat.diffuseTexture = beeBodyBackTex;
        let sideMat = new BABYLON.StandardMaterial('beeBodyMat2', this.scene);
        sideMat.diffuseTexture = beeBodyTex;
        let topBottomMat = new BABYLON.StandardMaterial('beeBodyMat4', this.scene);
        topBottomMat.diffuseTexture = rotatedBeeBodyTex;
        //put into one
        let multi = new BABYLON.MultiMaterial('beeBodyMatAll', this.scene);
        multi.subMaterials.push(backMat);
        multi.subMaterials.push(backMat);
        multi.subMaterials.push(sideMat);
        multi.subMaterials.push(sideMat);
        multi.subMaterials.push(topBottomMat);
        multi.subMaterials.push(topBottomMat);
        //apply material
        beeBody.subMeshes= [] ;
        let verticesCount = beeBody.getTotalVertices();

        // SubMesh(materialIndex: number, verticesStart: number, verticesCount: number, indexStart: any, indexCount: number, mesh: AbstractMesh, renderingMesh?: Mesh, createBoundingBox?: boolean);
        beeBody.subMeshes.push(new BABYLON.SubMesh(0, 0, verticesCount, 0, 6, beeBody));
        beeBody.subMeshes.push(new BABYLON.SubMesh(1, 1, verticesCount, 6, 6, beeBody));
        beeBody.subMeshes.push(new BABYLON.SubMesh(2, 2, verticesCount, 12, 6, beeBody));
        beeBody.subMeshes.push(new BABYLON.SubMesh(3, 3, verticesCount, 18, 6, beeBody));
        beeBody.subMeshes.push(new BABYLON.SubMesh(4, 4, verticesCount, 24, 6, beeBody));
        beeBody.subMeshes.push(new BABYLON.SubMesh(5, 5, verticesCount, 30, 6, beeBody));
        beeBody.material = multi;

      	//
      	// head
      	//

      	let beeHead = BABYLON.Mesh.CreateBox('beeHead', 1, this.scene);
      	beeHead.scaling.x = .3;
      	beeHead.scaling.y = .3;
      	beeHead.scaling.z = .3;
      	beeHead.position.x = .2;
        beeHead.position.y = .75;
        beeHead.rotation.y = Math.PI / 2;

        let beeHeadMat = new BABYLON.StandardMaterial('beeHeadMat', this.scene);
      	// beeHeadMat.diffuseColor = new BABYLON.Color3(.9, .8, 0);
      	beeHead.material = beeHeadMat;

        let beeHeadFrontTex = new BABYLON.Texture('textures/bee-head-front-0.png', this.scene);
        beeHeadFrontTex.vScale = -1;
        let beeHeadTopTex = new BABYLON.Texture('textures/bee-head-top-0.png', this.scene);
        let beeHeadLeftSideTex = new BABYLON.Texture('textures/bee-head-side-0.png', this.scene);
        let beeHeadRightSideTex = beeHeadLeftSideTex.clone();
        beeHeadLeftSideTex.wAng = Math.PI;
        beeHeadRightSideTex.wAng = Math.PI / 2;

        //Define a material
        let frontMat = new BABYLON.StandardMaterial('beeHeadMat0', this.scene);
        frontMat.diffuseTexture = beeHeadFrontTex;
        topBottomMat = new BABYLON.StandardMaterial('beeHeadMat1', this.scene);
        topBottomMat.diffuseTexture = beeHeadTopTex;
        let leftMat = new BABYLON.StandardMaterial('beeHeadMat2', this.scene);
        leftMat.diffuseTexture = beeHeadLeftSideTex;
        let rightMat = new BABYLON.StandardMaterial('beeHeadMat3', this.scene);
        rightMat.diffuseTexture = beeHeadRightSideTex;

        //put into one
        multi = new BABYLON.MultiMaterial('beeHeadMatAll', this.scene);
        multi.subMaterials.push(frontMat);
        multi.subMaterials.push(topBottomMat);
        multi.subMaterials.push(leftMat);
        multi.subMaterials.push(rightMat);
        multi.subMaterials.push(topBottomMat);
        multi.subMaterials.push(topBottomMat);
        //apply material
        beeHead.subMeshes= [] ;
        verticesCount = beeHead.getTotalVertices();

        // SubMesh(materialIndex: number, verticesStart: number, verticesCount: number, indexStart: any, indexCount: number, mesh: AbstractMesh, renderingMesh?: Mesh, createBoundingBox?: boolean);
        beeHead.subMeshes.push(new BABYLON.SubMesh(0, 0, verticesCount, 0, 6, beeHead));
        beeHead.subMeshes.push(new BABYLON.SubMesh(1, 1, verticesCount, 6, 6, beeHead));
        beeHead.subMeshes.push(new BABYLON.SubMesh(2, 2, verticesCount, 12, 6, beeHead));
        beeHead.subMeshes.push(new BABYLON.SubMesh(3, 3, verticesCount, 18, 6, beeHead));
        beeHead.subMeshes.push(new BABYLON.SubMesh(4, 4, verticesCount, 24, 6, beeHead));
        beeHead.subMeshes.push(new BABYLON.SubMesh(5, 5, verticesCount, 30, 6, beeHead));
        beeHead.material = multi;

      	//
      	// sting
      	//

      	let beeSting = CustomMesh.createPyramid('beeSting', this.scene, false);
      	beeSting.scaling.x = .1;
      	beeSting.scaling.y = .3;
      	beeSting.scaling.z = .1;
      	beeSting.position.x = -.25;
        beeSting.position.y = .75;
      	beeSting.rotation.z = Math.PI / 2;

        let beeStingMat = new BABYLON.StandardMaterial('beeStingMat', this.scene);
        beeStingMat.specularColor = BABYLON.Color3.White();
        beeStingMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
      	beeSting.material = beeStingMat;

      	//
      	// wings
      	//

      	let beeWings = BABYLON.Mesh.CreatePlane('beeWings', 1, this.scene, false, 2);
      	beeWings.scaling.x = .2;
        beeWings.scaling.y = .8;
        // beeWings.scaling.z = .4;
      	beeWings.position.x = -.1;
        beeWings.position.y = .75;
      	beeWings.rotation.x = Math.PI / 2;

        let beeWingsMat = new BABYLON.StandardMaterial('beeWingsMat', this.scene);
      	beeWingsMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
        beeWings.material = beeWingsMat;

        // hide blueprint
        beeBody.isVisible = false;
        beeHead.isVisible = false;
        beeSting.isVisible = false;
        beeWings.isVisible = false;

        /*

        //
        // body
        //
        let bodyMat = new BABYLON.StandardMaterial(matName + 'Body', this.scene);
        bodyMat.diffuseColor = BABYLON.Color3.Green();
        let mountainTex = new BABYLON.Texture('textures/orient.jpg', this.scene);
        bodyMat.diffuseTexture = mountainTex;

        let body = BABYLON.Mesh.CreateBox(meshName + 'Body', 1, this.scene, false, BABYLON.Mesh.FRONTSIDE);
        body.scaling.y = body.scaling.z = .25;
        body.scaling.x = .4;
        body.position.y = .5;
        body.material = bodyMat;

        //
        // head
        //
        let headMat = new BABYLON.StandardMaterial(matName + 'Head', this.scene);
        let headTex = new BABYLON.Texture('textures/tile-stone-0.png', this.scene);
        headMat.diffuseTexture = headTex;
        // headMat.diffuseColor = BABYLON.Color3.Black();

        let head = BABYLON.Mesh.CreateBox(meshName + 'Head', 1, this.scene, false, BABYLON.Mesh.FRONTSIDE);
        head.scaling.x = head.scaling.y = head.scaling.z = .3;
        head.position.y = .5;
        head.position.x = .15;
        head.material = headMat;

        mesh = BABYLON.Mesh.MergeMeshes([head, body]);

        */

        // mesh.material = mat;
        // mesh.isVisible = false;
      }

      let beeBody = (<BABYLON.Mesh>this.scene.getMeshByName('beeBody')).createInstance('beeBody' + thing.id);
      let beeHead = (<BABYLON.Mesh>this.scene.getMeshByName('beeHead')).createInstance('beeHead' + thing.id);
      let beeSting = (<BABYLON.Mesh>this.scene.getMeshByName('beeSting')).createInstance('beeSting' + thing.id);
      let beeWings = (<BABYLON.Mesh>this.scene.getMeshByName('beeWings')).createInstance('beeWings' + thing.id);

      let meshResizer = BABYLON.Mesh.CreatePlane(meshName + 'Resizer', 0, this.scene, false);
      meshResizer.isVisible = false;
      beeBody.parent = meshResizer;
      beeHead.parent = meshResizer;
      beeSting.parent = meshResizer;
      beeWings.parent = meshResizer;
      meshResizer.scaling.x = meshResizer.scaling.y = meshResizer.scaling.z = .45;

      mesh = BABYLON.Mesh.CreatePlane(meshName, 0, this.scene, false);
      mesh.isVisible = false;
      meshResizer.parent = mesh;

      mesh.position = thing.position;
      mesh.rotation = thing.rotation;
      mesh.scaling = thing.scaling;

      break;

      //
      // AGENT
      //
      case ThingType.BEAR:

      if (!mesh) {
        if (!mat) {
          mat = new BABYLON.StandardMaterial(matName, this.scene);
          (<BABYLON.StandardMaterial>mat).diffuseColor = BABYLON.Color3.Green();

          let mountainTex = new BABYLON.Texture('textures/orient.jpg', this.scene);
          (<BABYLON.StandardMaterial>mat).diffuseTexture = mountainTex;
        }

        let bearMat = new BABYLON.StandardMaterial('bearMat', this.scene);
        let bearBodyTex = new BABYLON.Texture('textures/bear-body-0.png', this.scene);
      	bearMat.specularColor = new BABYLON.Color3(0, 0, 0);
        bearMat.diffuseTexture = bearBodyTex;

        let head = BABYLON.Mesh.CreateBox('bearHead', .4, this.scene);
      	head.scaling.x = .75;
      	head.scaling.y = .85;
      	head.position.y = .35 + .5;
      	head.position.x = .025;

        //
        // head mat
        //

        let bearHeadFrontTex = new BABYLON.Texture('textures/bear-face-0.png', this.scene);
        bearHeadFrontTex.wAng = Math.PI / 2;
        // bearHeadFrontTex.vScale = -1;
        /*
        let beeHeadTopTex = new BABYLON.Texture('textures/bee-head-top-0.png', this.scene);
        let beeHeadLeftSideTex = new BABYLON.Texture('textures/bee-head-side-0.png', this.scene);
        let beeHeadRightSideTex = beeHeadLeftSideTex.clone();
        beeHeadLeftSideTex.wAng = Math.PI;
        beeHeadRightSideTex.wAng = Math.PI / 2;
        */

        //Define a material
        let frontMat = new BABYLON.StandardMaterial('bearHeadMat0', this.scene);
        frontMat.diffuseTexture = bearHeadFrontTex;

        /*
        topBottomMat = new BABYLON.StandardMaterial('bearHeadMat1', this.scene);
        topBottomMat.diffuseTexture = beeHeadTopTex;
        let leftMat = new BABYLON.StandardMaterial('bearHeadMat2', this.scene);
        leftMat.diffuseTexture = beeHeadLeftSideTex;
        let rightMat = new BABYLON.StandardMaterial('bearHeadMat3', this.scene);
        rightMat.diffuseTexture = beeHeadRightSideTex;
        */

        //put into one
        let multi = new BABYLON.MultiMaterial('bearHeadMatAll', this.scene);
        multi.subMaterials.push(bearMat);
        multi.subMaterials.push(bearMat);
        multi.subMaterials.push(frontMat);
        multi.subMaterials.push(bearMat);
        multi.subMaterials.push(bearMat);
        multi.subMaterials.push(bearMat);
        /*
        multi.subMaterials.push(topBottomMat);
        multi.subMaterials.push(leftMat);
        multi.subMaterials.push(rightMat);
        multi.subMaterials.push(topBottomMat);
        multi.subMaterials.push(topBottomMat);
        */
        //apply material
        head.subMeshes= [] ;
        let verticesCount = head.getTotalVertices();

        // SubMesh(materialIndex: number, verticesStart: number, verticesCount: number, indexStart: any, indexCount: number, mesh: AbstractMesh, renderingMesh?: Mesh, createBoundingBox?: boolean);
        head.subMeshes.push(new BABYLON.SubMesh(0, 0, verticesCount, 0, 6, head));
        head.subMeshes.push(new BABYLON.SubMesh(1, 1, verticesCount, 6, 6, head));
        head.subMeshes.push(new BABYLON.SubMesh(2, 2, verticesCount, 12, 6, head));
        head.subMeshes.push(new BABYLON.SubMesh(3, 3, verticesCount, 18, 6, head));
        head.subMeshes.push(new BABYLON.SubMesh(4, 4, verticesCount, 24, 6, head));
        head.subMeshes.push(new BABYLON.SubMesh(5, 5, verticesCount, 30, 6, head));
        head.material = multi;

      	let lEar = BABYLON.Mesh.CreateCylinder('bearLEar', .025, .15, .15, 8, 1, this.scene, false);
      	lEar.position.z = -.13;
      	lEar.position.y = .55 + .5;
      	lEar.rotation.z = Math.PI / 2;
      	lEar.rotation.x = .4;
        lEar.material = bearMat;

      	let rEar = BABYLON.Mesh.CreateCylinder('bearREar', .025, .15, .15, 6, 1, this.scene, false);
      	rEar.position.z = .13;
      	rEar.position.y = .55 + .5;
      	rEar.rotation.z = Math.PI / 2;
      	rEar.rotation.x = .4;
        rEar.material = bearMat;

      	let body = BABYLON.Mesh.CreateBox('bearBody', .6, this.scene);
      	body.scaling.x = .35;
      	body.scaling.z = .5;
      	body.position.y = -.025 + .5;
        body.material = bearMat;

      	let tail = BABYLON.Mesh.CreateBox('bearTail', .075, this.scene);
      	tail.position.y = -.2 + .5;
      	tail.position.x = -.125;
        tail.material = bearMat;

      	let lHandPart = BABYLON.Mesh.CreateBox('bearLHandPart', .25, this.scene);
      	lHandPart.scaling.x = lHandPart.scaling.y = .4;
      	lHandPart.position.z = -.15;
        lHandPart.material = bearMat;

      	let lHand = BABYLON.Mesh.CreatePlane('bearLHand', 1, this.scene);
      	lHand.isVisible = false;
      	lHandPart.parent = lHand;
      	lHand.position.z = -.1;
      	lHand.position.y = .075 + .5;
      	lHand.rotation.x = -Math.PI / 2.75;

      	let rHandPart = BABYLON.Mesh.CreateBox('bearRHandPart', .25, this.scene);
      	rHandPart.scaling.x = rHandPart.scaling.y = .4;
      	rHandPart.position.z = -.15;
        rHandPart.material = bearMat;

      	let rHand = BABYLON.Mesh.CreatePlane('bearRHand', 1, this.scene);
      	rHand.isVisible = false;
      	rHandPart.parent = rHand;
      	rHand.position.z = .1;
      	rHand.position.y = .075 + .5;
      	rHand.rotation.x = -Math.PI / 2.75;
      	rHand.rotation.y = Math.PI;

      	let lFootPart = BABYLON.Mesh.CreateBox('bearLFootPart', .2, this.scene);
      	lFootPart.scaling.x = lFootPart.scaling.z = .5;
      	lFootPart.position.y = -.1;
        lFootPart.material = bearMat;

      	let lFoot = BABYLON.Mesh.CreatePlane('bearLFoot', 1, this.scene);
      	lFoot.isVisible = false;
      	lFootPart.parent = lFoot;
      	lFoot.position.z = -.1;
      	lFoot.position.y = -.3 + .5;
      	lFoot.rotation.z = .4;

      	let rFootPart = BABYLON.Mesh.CreateBox('bearRFootPart', .2, this.scene);
      	rFootPart.scaling.x = rFootPart.scaling.z = .5;
      	rFootPart.position.y = -.1;
        rFootPart.material = bearMat;

      	let rFoot = BABYLON.Mesh.CreatePlane('bearRFoot', 1, this.scene);
      	rFoot.isVisible = false;
      	rFootPart.parent = rFoot;
      	rFoot.position.z = .1;
      	rFoot.position.y = -.3 + .5;
      	rFoot.rotation.z = -.4;

        mesh = BABYLON.Mesh.CreatePlane(meshName, 0, this.scene, false);
        mesh.isVisible = false;
        head.parent = mesh;
        rEar.parent = mesh;
        lEar.parent = mesh;
        body.parent = mesh;
        rHand.parent = mesh;
        lHand.parent = mesh;
        tail.parent = mesh;
        lFoot.parent = mesh;
        rFoot.parent = mesh;

      } else {
        throw 'only one bear allowed';
      }

      // mesh = (<BABYLON.Mesh>mesh).createInstance('' + thing.id);

      // adjust follow camera
      this.camera.target = mesh;

      mesh.position = thing.position;
      mesh.rotation = thing.rotation;
      mesh.scaling = thing.scaling;

      break;

      default:
        debugger;
    }

    if (!mesh) {
      debugger;
    }
  }

  animateHiveCollision(hiveThing: Thing) {
    let mesh = this.scene.getMeshByID('' + hiveThing.id);
    this.hiveCollisionParticleSystem.emitter = mesh;

    // unbind hive pos from thing
    mesh.position = mesh.position.clone();
    mesh.rotation = mesh.rotation.clone();
    mesh.scaling = mesh.scaling.clone();
    // mesh.isVisible = false;

    let event = new BABYLON.AnimationEvent(30, () => {
      this.removeThingView(hiveThing);
    }, true);

    // Attach your event to your animation
    this.hiveCollisionParticleAnimation.addEvent(event);
    this.scene.beginAnimation(this.hiveCollisionParticleSystem, 0, 30, false);

    // hive scale animation
    mesh.animations.push(this.hiveCollisionAnimation);
    this.scene.beginAnimation(mesh, 0, 30, false, 2.5);
  }

  destroy() {
    throw 'TBD';
  }

  render() {
    throw 'TBD';
  }
}

export = Renderer;
