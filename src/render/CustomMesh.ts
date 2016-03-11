/// <reference path="../../typings/interfaces.d.ts"/>

import Randomizer = require('../utils/Randomizer');
import types = require('../types');

const V2 = BABYLON.Vector2;
const V3 = BABYLON.Vector3;

/////////////////////////////////////////
// TOOLS
///////////////////////////////////////

// data: [[x, y, z, uvx, uvy]]
function parseVDList(data: number[][]): { positions: number[], normals: number[], uvs: number[] } {
  let positions: number[] = [];
  let uvs: number[] = [];
  let normals: number[] = [];

  data.forEach(function(v) {
    if (v.length < 3) {
      throw 'v parsing error';
    }

    positions.push(v[0], v[1], v[2]);
    normals.push(0, 0, 0);
    uvs.push(v[3] || 0, v[4] || 0);
  });

  return {
    positions,
    normals,
    uvs
  };
}

///////////////////////////////////////////
// PYRAMID
/////////////////////////////////////////


///////////////////////////////////////////
// Public
/////////////////////////////////////////

class CustomMesh {

  //////////////
  // pyramid
  ////////////

  static createPyramid(name: string, scene: BABYLON.Scene, updatable: boolean = false): BABYLON.Mesh {
    let mesh = BABYLON.MeshBuilder.CreatePolyhedron(name + Math.random(), {type: 8, size: 1, updatable: updatable, sideOrientation: BABYLON.Mesh.FRONTSIDE}, scene);
    // fix default pyramid settings
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

  static createOctahedron(name: string, scene: BABYLON.Scene, updatable: boolean = false) {
    let mesh = BABYLON.MeshBuilder.CreatePolyhedron(name + Math.random(), {type: 1, size: 1, updatable: updatable, sideOrientation: BABYLON.Mesh.FRONTSIDE}, scene);
    mesh.scaling.x = mesh.scaling.y = mesh.scaling.z = .5;

    let finalMesh = BABYLON.Mesh.MergeMeshes([mesh], true, true);
    finalMesh.name = name;

    return finalMesh;
  }

  static createTree(name: string, width: number, height: number, scene: BABYLON.Scene, updatable: boolean = false, nextReal: Function = Math.random): BABYLON.Mesh {
    let meshes = [];
    let partCount = 2 + Math.round(nextReal() * 3);
    let sizeD = .5 + .5 * nextReal();
    let sizeH = sizeD + nextReal() * (sizeD * 3);

    let polygon = CustomMesh.createPyramid(name, scene);
    polygon.scaling.x = polygon.scaling.z = sizeD;
    polygon.scaling.y = sizeH;
    polygon.position.y = .05;

    return polygon;
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
