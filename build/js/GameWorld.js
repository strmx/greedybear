/// <reference path="../typings/babylon.2.2.d.ts" />
define(["require", "exports"], function (require, exports) {
    var GameWorld = (function () {
        function GameWorld(canvas) {
            var _this = this;
            this.canvas = canvas;
            this._isMouseOnScene = false;
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
            // cube
            //
            var cube = BABYLON.Mesh.CreateBox('cube', 1, this.scene);
            cube.position = BABYLON.Vector3.Zero();
            var cubeMat = new BABYLON.StandardMaterial('cubeMat', this.scene);
            // cubeMat.specularColor = BABYLON.Color3.Blue();
            // cubeMat.diffuseColor = BABYLON.Color3.Red();
            cubeMat.wireframe = true;
            cube.material = cubeMat;
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
                var t = _this.engine.getDeltaTime();
                _this.scene.render();
            });
            this.scene.render();
        };
        return GameWorld;
    })();
    return GameWorld;
});
