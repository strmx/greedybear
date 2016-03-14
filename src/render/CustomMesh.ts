/// <reference path="../../typings/interfaces.d.ts"/>

import types = require('../types');

const V2 = BABYLON.Vector2;
const V3 = BABYLON.Vector3;

///////////////////////////////////////////
// Public
/////////////////////////////////////////

class CustomMesh {

  static createTree(name: string, scene: BABYLON.Scene): BABYLON.Mesh {
    // trunk
    // var cylinder = BABYLON.Mesh.CreateCylinder("cylinder", 1.5, .1, 1, 4, 1, scene, false);
    //                       CreateCylinder(name: string, height: number, diameterTop: number, diameterBottom: number, tessellation: number, subdivisions: any, scene: Scene, updatable?: any, sideOrientation?: number): Mesh;
    let trunk = BABYLON.Mesh.CreateCylinder(name + Math.random(), 1.25, .2, .5, 3, 1, scene, false, BABYLON.Mesh.FRONTSIDE);
    trunk.convertToFlatShadedMesh();

    // shift uvs
    // http://www.babylonjs-playground.com/#KGUJW#1
		let uvs = trunk.getVerticesData(BABYLON.VertexBuffer.UVKind);
		for (let j = 0; j < uvs.length; j += 2) {
			uvs[j + 1] = uvs[j + 1] * .5;
		}
		trunk.setVerticesData(BABYLON.VertexBuffer.UVKind, uvs);


    // let trunk = BABYLON.Mesh.CreateBox(name + Math.random(), 1, scene, false, BABYLON.Mesh.FRONTSIDE);
    // trunk.scaling.x = .2;
    // trunk.scaling.z = .2;
    // trunk.scaling.y = 2;
    trunk.position.y = .5;

    // foliage
    // let foliage = CustomMesh.createOctahedron(name + Math.random(), scene);
    let foliage = BABYLON.Mesh.CreateSphere(name + Math.random(), 1, 1, scene);
    foliage.convertToFlatShadedMesh();

    // shift uvs
    uvs = foliage.getVerticesData(BABYLON.VertexBuffer.UVKind);
		for (let j = 0; j < uvs.length; j += 2) {
			uvs[j + 1] = uvs[j + 1] * .5  + .5;
		}
		foliage.setVerticesData(BABYLON.VertexBuffer.UVKind, uvs);

    // foliage.scaling.x = foliage.scaling.z = 1;
    // foliage.scaling.y = 1.5;
    foliage.position.y = .75;
    // foliage.rotation.y = 45 * (Math.PI / 180);

    let finalMesh = BABYLON.Mesh.MergeMeshes([trunk, foliage], true, true);
    finalMesh.name = name;

    return finalMesh;
  }

  static createLake(lake: LakeArea, name: string, scene: BABYLON.Scene): BABYLON.Mesh {
    let planes: BABYLON.Mesh[] = lake.rects.map((rect: RectArea) => {
      let plane = BABYLON.Mesh.CreatePlane(name + Math.random(), rect.w, scene, false, BABYLON.Mesh.FRONTSIDE);
      plane.position.x = rect.x + rect.w / 2 - .5;
      plane.position.z = rect.y + rect.w / 2 - .5;
      // plane.position.y = .1;
      plane.rotation.x = 90 * (Math.PI / 180);

      if (rect.w > 1 || rect.h > 1) {
        let uvs = plane.getVerticesData(BABYLON.VertexBuffer.UVKind);
    		for (let j = 0; j < uvs.length; j += 1) {
    			uvs[j] = uvs[j] * rect.w;
    		}
    		plane.setVerticesData(BABYLON.VertexBuffer.UVKind, uvs);
      }

      return plane;
    });

    let lakeMesh = BABYLON.Mesh.MergeMeshes(planes, true, true);
    lakeMesh.name = name;

    return lakeMesh;
  }

  static createTriangularPrism(name: string, scene: BABYLON.Scene, updatable: boolean = false): BABYLON.Mesh {
    let mesh = BABYLON.MeshBuilder.CreatePolyhedron(name + Math.random(), {type: 5, size: 1, updatable: updatable, sideOrientation: BABYLON.Mesh.FRONTSIDE}, scene);

    // fix default settings
    // http://www.babylonjs-playground.com/#1EVRUK#2
    mesh.rotation.x = 40.9 * (Math.PI / 180);
    mesh.rotation.y = 90.25 * (Math.PI / 180);
    mesh.rotation.z = -48.5 * (Math.PI / 180);
    mesh.scaling.x = mesh.scaling.y = mesh.scaling.z = .575;
    mesh.position.y = .52;

    let finalMesh = BABYLON.Mesh.MergeMeshes([mesh], true, true);
    finalMesh.name = name;

    return finalMesh;
  }

  static createOctahedron(name: string, scene: BABYLON.Scene, updatable: boolean = false) {
    let mesh = BABYLON.MeshBuilder.CreatePolyhedron(name + Math.random(), {type: 1, size: 1, updatable: updatable, sideOrientation: BABYLON.Mesh.FRONTSIDE}, scene);
    mesh.scaling.x = mesh.scaling.y = mesh.scaling.z = .5;

    let finalMesh = BABYLON.Mesh.MergeMeshes([mesh], true, true);
    finalMesh.name = name;

    return finalMesh;
  }

  static createPyramid(name: string, scene: BABYLON.Scene, updatable: boolean = false): BABYLON.Mesh {
    let mesh = BABYLON.MeshBuilder.CreatePolyhedron(name + Math.random(), {type: 8, size: 1, updatable: updatable, sideOrientation: BABYLON.Mesh.FRONTSIDE}, scene);

    // fix default settings
    // http://www.babylonjs-playground.com/#1EVRUK#1
    mesh.rotation.x = -139 * (Math.PI / 180);
    mesh.rotation.y = -9 * (Math.PI / 180);
    mesh.rotation.z = 9 * (Math.PI / 180);
    mesh.scaling.x = mesh.scaling.y = mesh.scaling.z = .7;
    mesh.position.y = .14055;

    let finalMesh = BABYLON.Mesh.MergeMeshes([mesh], true, true);
    finalMesh.name = name;

    return finalMesh;
  }

  static normalizePyramidTexture(texture: BABYLON.Texture): void {
    texture.uScale = 1;
    texture.vScale = -.665;
  }

  static createGroundFromHeightMap(name: string, buffer: Uint8Array, bufferWidth: number, bufferHeight: number, width: number, height: number, subdivisions: number, minHeight: number, maxHeight: number, scene: BABYLON.Scene, updatable?: boolean): BABYLON.GroundMesh {
    let ground = new BABYLON.GroundMesh(name, scene);
    ground._subdivisions = subdivisions;
    ground._width = width;
    ground._height = height;
    ground._maxX = ground._width / 2;
    ground._maxZ = ground._height / 2;
    ground._minX = -ground._maxX;
    ground._minZ = -ground._maxZ;
    // ground.convertToFlatShadedMesh();

    // Create VertexData from map data
    let vertexData = BABYLON.VertexData.CreateGroundFromHeightMap({
      width, height,
      subdivisions,
      minHeight, maxHeight,
      buffer, bufferWidth, bufferHeight
    });

    vertexData.applyToMesh(ground, updatable);

    ground.convertToFlatShadedMesh();

    return ground;
  }
};

export = CustomMesh;
