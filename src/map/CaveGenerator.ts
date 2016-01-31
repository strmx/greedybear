'use strict';


enum CELL_TYPE {
  WALL = 1,
  ROAD = 0,
};

// TODO: move to MapHelper.ts
function createFilledMap(n : number, m : number, defautValue : any) {
  let isFunction = typeof defautValue === 'function';
  let map = [];
  let count = 0;

  for (let i = 0; i < n; i++) {
    let col = [];
    map[i] = col;
    for (let j = 0; j < m; j++) {
      count++;
      col[j] = isFunction ? defautValue(i, j, count, map) : defautValue;
    }
  }
  return map;
}

// TODO: move to MapHelper.ts
function fillMapUniform(map : any[][], chance : number, fillValue : any) : void {
  if (!map || !map.length || !map[0] || !map[0].length) {
    return;
  }

  let isFunction = typeof fillValue === 'function';
  let n = map.length;
  let m = map[0].length;
  let count = 0;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (Math.random() < chance) {
        count++;
        map[i][j] = isFunction ? fillValue(i, j, count, map) : fillValue;
      }
    }
  }
}

// flood into fillMap
function floodFill(map : number[][], x : number, y : number, fillMap : number[][]) : number {
  let n = map.length;
  let m = map[0].length;
  let filledCount = 0;
  let fill = (i : number, j : number) => {
    // out of bounds
    if (i < 0 || j < 0 || i >= n || j >= m) {
      return;
    }
    if (map[i][j] === 0 && fillMap[i][j] === 0) {
      filledCount++;
      fillMap[i][j] = 1;
      fill(i - 1, j);
      fill(i + 1, j);
      fill(i, j - 1);
      fill(i, j + 1);
    }
  }

  fill(x, y);

  return filledCount;
}

function countNotEmptyNeighbours(map : any[][], x : number, y : number) : number {
  if (!map || !map.length || !map[0] || !map[0].length) {
    return 0;
  }

  let n = map.length;
  let m = map[0].length;
  let neighbourX : number, neighbourY : number;
  let outOfBound : boolean;
  let neighbourCount = 0;

  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      // skip self
      if (i !== 0 || j !== 0) {
        neighbourX = x + i;
        neighbourY = y + j;
        outOfBound = neighbourX < 0 || neighbourY < 0 || neighbourX >= n || neighbourY >= m;

        if (outOfBound || map[neighbourX][neighbourY] === CELL_TYPE.WALL){
            neighbourCount ++;
        }
      }
    }
  }

  return neighbourCount;
}

function generateNextStepCaveMap(map : any[][], birthLimit : number, deathLimit : number) : any[][] {
  if (!map || !map.length || !map[0] || !map[0].length) {
    return null;
  }

  let n = map.length;
  let m = map[0].length;
  let neighbourCount = 0;
  let nextStepMap = createFilledMap(n, m, CELL_TYPE.ROAD);

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {

      neighbourCount = countNotEmptyNeighbours(map, i, j);

      if(map[i][j] === CELL_TYPE.WALL) {
        if(neighbourCount < deathLimit) {
          nextStepMap[i][j] = CELL_TYPE.ROAD;
        // } if(neighbourCount < starvationLimit) {
        //   nextStepMap[i][j] = EMPTY_CELL_VALUE;
        } else {
          nextStepMap[i][j] = CELL_TYPE.WALL;
        }
      } else {
        if(neighbourCount > birthLimit) {
          nextStepMap[i][j] = CELL_TYPE.WALL;
        } else {
          nextStepMap[i][j] = CELL_TYPE.ROAD;
        }
      }
    }
  }

  return nextStepMap;
}

function redrawMap(map : any[][], canvas : HTMLCanvasElement, cellSize : number) : void {
  let n = map.length;
  let m = map[0].length;
  let ctx = canvas.getContext('2d');

  ctx.fillStyle = '#996633';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#000';

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (map[i][j] === CELL_TYPE.WALL) {
        ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
      }
    }
  }
}

import CanvasElement = require('../CanvasElement');

class A {
  constructor() {
    let canvas = new CanvasElement(document.body).element;

    // resize scene
    this.updateCanvasSize(canvas);
    window.addEventListener('resize', e => {
      this.updateCanvasSize(canvas);
    });

    const CELL_SIZE = 2;
    const BIRTH_LIMIT = 4;
    const DEATH_LIMIT = 3;
    let map = createFilledMap(~~(canvas.width / CELL_SIZE), ~~(canvas.height / CELL_SIZE), CELL_TYPE.ROAD);
    fillMapUniform(map, .4, CELL_TYPE.WALL);

    let redrawCount = 0;
    for (let i=0; i<2; i++) {
      map = generateNextStepCaveMap(map, BIRTH_LIMIT, DEATH_LIMIT);
      redrawMap(map, canvas, CELL_SIZE);
      console.log('redrawCount', ++redrawCount);
    }
  }

  updateCanvasSize(canvas) {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
  }
}



export = A;
