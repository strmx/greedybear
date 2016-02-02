import PatternHelper = require('./PatternHelper');

enum CELL_TYPE {
  WALL = 1,
  ROAD = 0,
};

class CaveGenerator {
  static CELL_TYPE = CELL_TYPE;

  public static generateCaveLikeMap(options: {n: number, m: number, wallChance: number, stepCount: number, nextReal: Function, birthLimit: number, deathLimit: number}): number[][] {
    let map = PatternHelper.createFilledMap(options.n, options.m, CELL_TYPE.ROAD);
    PatternHelper.fillMapUniform(map, options.wallChance, options.nextReal, CELL_TYPE.WALL);

    for (let i=0; i<options.stepCount; i++) {
      map = CaveGenerator.generateNextStepCaveMap(map, options.birthLimit, options.deathLimit);
    }

    return map;
  }

  // leave only biggest one on arg:map
  // returns list of open area cells
  public static removeSmallOpenAreas(map: number[][]): {x: number, y:number}[] {
    let openAreas = PatternHelper.findOpenAreas(map, CELL_TYPE.ROAD);

    if (openAreas.length === 0) {
      return null;
    }

    if (openAreas.length > 1) {
      // remove open areas
      openAreas
        // except biggest area
        .slice(1)
        .forEach((cells) => {
          cells.forEach((pos) => {
            map[pos.x][pos.y] = CELL_TYPE.WALL;
          });
        });
    }

    return openAreas[0];
  }

  public static generateNextStepCaveMap(map: number[][], birthLimit: number, deathLimit: number): number[][] {
    if (!map || !map.length || !map[0] || !map[0].length) {
      return null;
    }

    let n = map.length;
    let m = map[0].length;
    let neighbourCount = 0;
    let nextStepMap = PatternHelper.createFilledMap(n, m, 0);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {

        neighbourCount = PatternHelper.countNotEmptyNeighbours(map, i, j, CELL_TYPE.ROAD);

        if(map[i][j] === CELL_TYPE.WALL) {
          if(neighbourCount < deathLimit) {
            nextStepMap[i][j] = CELL_TYPE.ROAD;
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

  public static redrawMap(map: number[][], canvas: HTMLCanvasElement, cellSize: number): void {
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
