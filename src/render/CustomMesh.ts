/// <reference path="../../typings/interfaces.d.ts"/>

import Randomizer = require('../utils/Randomizer');
import types = require('../types');

const V2 = BABYLON.Vector2;
const V3 = BABYLON.Vector3;

/////////////////////////////////////////
// TOOLS
///////////////////////////////////////

// data: [[x, y, z, uvx, uvy]]
function parseVDList(data: number[][]): {positions: number[], normals: number[], uvs: number[]} {
  let positions: number[] = [];
  let uvs: number[] = [];
  let normals: number[] = [];

  data.forEach(function (v) {
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

/*

complex samples:
  http://www.html5gamedevs.com/topic/17342-polyhedrons-first-attemp/#comment-100654
  http://www.html5gamedevs.com/topic/17691-texture-on-individual-faces-of-a-polyhedron/
  http://www.babylonjs-playground.com/#21QRSK#5
  http://www.babylonjs-playground.com/#21QRSK#6
*/
function createPyramidVertexData(width: number, height: number): BABYLON.VertexData {
  let hw = width / 2;
  let vertexKinds = parseVDList([
    [
      -hw, 0, hw
    ], [
      hw, 0, hw
    ], [
      hw, 0, -hw
    ], [
      -hw, 0, -hw
    ], [
      0, height, 0
    ]
  ]);

  let indices = [
    1, 0, 4,
    2, 1, 4,
    3, 2, 4,
    0, 3, 4
  ];

  // some sample: http://www.babylonjs-playground.com/#1H7L5C

  // not important for FRONTSIDE
  // BABYLON.VertexData._ComputeSides(BABYLON.Mesh.FRONTSIDE, vertexKinds.positions, indices, vertexKinds.normals, vertexKinds.uvs);

  // set default normals
  BABYLON.VertexData.ComputeNormals(vertexKinds.positions, indices, vertexKinds.normals);

  // Result
  let vertexData = new BABYLON.VertexData();
  vertexData.indices = indices;
  vertexData.positions = vertexKinds.positions;
  vertexData.normals = vertexKinds.normals;
  vertexData.uvs = vertexKinds.uvs;

  return vertexData;
}

///////////////////////////////////////////
// Public
/////////////////////////////////////////

class CustomMesh {
  static createPyramid(name: string, width: number, height: number, scene: BABYLON.Scene, updatable: boolean = false): BABYLON.Mesh {
    let vertexData = createPyramidVertexData(width, height);
    let polygon = new BABYLON.Mesh(name, scene);
    vertexData.applyToMesh(polygon, updatable);

    // recalculate normals to flat
    polygon.convertToFlatShadedMesh();

    return polygon;
  }
};

export = CustomMesh;
