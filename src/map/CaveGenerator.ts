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

        if (outOfBound || map[neighbourX][neighbourY] === EMPTY_CELL_VALUE){
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
        if(neighbourCount > deathLimit) {
          nextStepMap[i][j] = 1;
        }
      } else {
        if(neighbourCount > birthLimit) {
          nextStepMap[i][j] = 1;
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

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#333333';

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (map[i][j] !== EMPTY_CELL_VALUE) {
        ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
      }
    }
  }
}

const CHANCE_TO_START_ALIVE = 0.45;


import CanvasElement = require('../CanvasElement');

class A {
  constructor() {
    let canvas = new CanvasElement(document.body).element;

    // resize scene
    this.updateCanvasSize(canvas);
    window.addEventListener('resize', e => {
      this.updateCanvasSize(canvas);
    });

    const birthLimit = 4;
    const deathLimit = 3;
    let map = createFilledMap(320, 240, EMPTY_CELL_VALUE);
    fillMapUniform(map, .4, 1);
    map = generateNextStepCaveMap(map, birthLimit, deathLimit);
    map = generateNextStepCaveMap(map, birthLimit, deathLimit);

    redrawMap(map, canvas, 3);
  }

  updateCanvasSize(canvas) {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
  }
}



export = A;
