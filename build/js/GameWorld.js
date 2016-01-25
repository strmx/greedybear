/// <reference path="../typings/babylon.2.2.d.ts" />
/// <reference path="../typings/rx.all.d.ts" />
define(["require", "exports", './tools/d2r'], function (require, exports, d2r) {
    var GameWorld = (function () {
        function GameWorld(canvas) {
            var _this = this;
            this.canvas = canvas;
            this._isMouseOnScene = false;
            this.observable = new Rx.Subject();
            this._constructWorld();
            // resize scene
            window.addEventListener('resize', function (e) {
                _this.engine.resize();
            });
        }
        GameWorld.prototype._constructWorld = function () {
            var _this = this;
            //
            // engine
            // The engine is the object interacting with the low-level WebGL API
            this.engine = new BABYLON.Engine(this.canvas, true);
            // a container that stores all objects you need to render
            this.scene = new BABYLON.Scene(this.engine);
            // this.scene.clearColor = BABYLON.Color3.White();
            //
            // simulates sun-light (casts light on everything in the scene along its direction)
            //
            this.light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 10, 0), this.scene);
            this.light.diffuse = new BABYLON.Color3(1, 1, 1);
            this.light.specular = BABYLON.Color3.White();
            this.light.intensity = .7;
            // this.light.groundColor = BABYLON.Color3.Black();
            //
            // ground
            //
            var ground = BABYLON.Mesh.CreateGround('grd', 150, 150, 1, this.scene);
            ground.position = new BABYLON.Vector3(0, -200, 0);
            var groundMat = new BABYLON.StandardMaterial('gmat', this.scene);
            groundMat.diffuseTexture = new BABYLON.Texture('assets/textures/orient.jpg', this.scene);
            groundMat.emissiveTexture = new BABYLON.Texture('assets/textures/orient.jpg', this.scene);
            ground.material = groundMat;
            //
            // sky
            //
            // (name, height, diamTop, diamBottom, tessellation, [optional height subdivs], scene, updatable)
            var sky = BABYLON.Mesh.CreateCylinder("sky", 100, 100, 100, 6, 1, this.scene, false);
            sky.position = BABYLON.Vector3.Zero();
            var skyMat = new BABYLON.StandardMaterial('skyMat', this.scene);
            // skyMat.specularColor = BABYLON.Color3.Blue();
            // skyMat.diffuseColor = BABYLON.Color3.Red();
            skyMat.wireframe = true;
            sky.material = skyMat;
            //
            // head
            //
            this._head = BABYLON.Mesh.CreateBox('head', 0, this.scene);
            this._head.isVisible = false;
            var cube = BABYLON.Mesh.CreateCylinder("cylinder", 1, .1, 1, 6, 1, this.scene, false);
            cube.parent = this._head;
            cube.position = BABYLON.Vector3.Zero();
            var cubeMat = new BABYLON.StandardMaterial('cubeMat', this.scene);
            cubeMat.specularColor = BABYLON.Color3.Blue();
            cubeMat.diffuseColor = BABYLON.Color3.Red();
            cubeMat.wireframe = true;
            cube.material = cubeMat;
            cube.rotation = new BABYLON.Vector3(0, 0, d2r(-90));
            // orient right by default
            // cube.rotate(BABYLON.Axis.Z, -90 * (Math.PI / 180), BABYLON.Space.LOCAL);
            //
            // camera
            //
            this.camera = new BABYLON.FreeCamera('FreeCamera', new BABYLON.Vector3(0, 50, 0), this.scene);
            // this.camera.position = new BABYLON.Vector3(0, 5, 0);
            // this.camera.setTarget(BABYLON.Vector3.Zero());
            // this.camera.attachControl(this.canvas, true);
            this.camera.rotation.x = 90 * (Math.PI / 180);
            window.cam = this.camera;
            // stop rotation on leave
            this.canvas.addEventListener('mouseenter', function (e) {
                _this._isMouseOnScene = true;
            });
            // stop rotation on leave
            this.canvas.addEventListener('mouseleave', function (e) {
                _this._isMouseOnScene = false;
            });
            //
            // render
            //
            this.engine.runRenderLoop(function () {
                var sec = _this.engine.getDeltaTime() / 1000;
                _this.observable.onNext(sec);
                _this.scene.render();
            });
            this.scene.render();
        };
        GameWorld.prototype.destroy = function () {
            this.observable.dispose();
        };
        return GameWorld;
    })();
    return GameWorld;
});
