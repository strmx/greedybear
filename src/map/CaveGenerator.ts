import MapHelper = require('./MapHelper');

enum CELL_TYPE {
  WALL = 1,
  ROAD = 0,
};

class CaveGenerator {
  static CELL_TYPE = CELL_TYPE;

  public static generate(options: {n: number, m: number, nextReal: Function, birthLimit: number, deathLimit: number}) : number[][] {
    let map = MapHelper.createFilledMap(options.n, options.m, CELL_TYPE.ROAD);
    MapHelper.fillMapUniform(map, .4, options.nextReal, CELL_TYPE.WALL);

    for (let i=0; i<2; i++) {
      map = CaveGenerator.generateNextStepCaveMap(map, options.birthLimit, options.deathLimit);
    }

    return map;
  }

  public static generateNextStepCaveMap(map : any[][], birthLimit : number, deathLimit : number) : any[][] {
    if (!map || !map.length || !map[0] || !map[0].length) {
      return null;
    }

    let n = map.length;
    let m = map[0].length;
    let neighbourCount = 0;
    let nextStepMap = MapHelper.createFilledMap(n, m, 0);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {

        neighbourCount = MapHelper.countNotEmptyNeighbours(map, i, j, CELL_TYPE.ROAD);

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

  public static redrawMap(map : number[][], canvas : HTMLCanvasElement, cellSize : number) : void {
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
}

export = CaveGenerator;
