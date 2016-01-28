'use strict';

const EMPTY_CELL_VALUE : number = 0;

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

        // if (map[neighbourX][neighbourY] !== EMPTY_CELL_VALUE){
        if (outOfBound || map[neighbourX][neighbourY] !== EMPTY_CELL_VALUE){
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
  let nextStepMap = createFilledMap(n, m, EMPTY_CELL_VALUE);

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {

      neighbourCount = countNotEmptyNeighbours(map, i, j);

      if(map[i][j] !== EMPTY_CELL_VALUE) {
        if(neighbourCount < deathLimit) {
          nextStepMap[i][j] = EMPTY_CELL_VALUE;
        } else {
          nextStepMap[i][j] = 1;
        }
      } else {
        if(neighbourCount > birthLimit) {
          nextStepMap[i][j] = 1;
        } else {
          nextStepMap[i][j] = EMPTY_CELL_VALUE;
        }
      }
    }
  }

  return nextStepMap;
}

function redrawMap(map : any[][], canvas : HTMLCanvasElement, cellSize : number = 1) : void {
  let n = map.length;
  let m = map[0].length;
  let ctx = canvas.getContext('2d');

  ctx.fillStyle = '#996633';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#000';

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (map[i][j] !== EMPTY_CELL_VALUE) {
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
    let map = createFilledMap(~~(canvas.width / CELL_SIZE), ~~(canvas.height / CELL_SIZE), EMPTY_CELL_VALUE);
    fillMapUniform(map, .4, 1);

    // for (let i=0; i<10; i++) {
    let redrawCount = 0;
    setInterval(() => {
      map = generateNextStepCaveMap(map, BIRTH_LIMIT, DEATH_LIMIT);
      redrawMap(map, canvas, CELL_SIZE);
      console.log('redrawCount', ++redrawCount);
    }, 500);
  }

  updateCanvasSize(canvas) {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
  }
}



export = A;
