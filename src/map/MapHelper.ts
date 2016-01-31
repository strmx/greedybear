import Randomizer = require('../utils/Randomizer');

class MapHelper {
  public static createFilledMap(n: number, m: number, defautValue: number): number[][] {
    let isFunction = typeof defautValue === 'function';
    let map = [];
    let count = 0;

    for (let i = 0; i < n; i++) {
      let col = [];
      map[i] = col;
      for (let j = 0; j < m; j++) {
        count++;
        col[j] = defautValue;
      }
    }
    return map;
  }

  public static fillMapUniform(map: number[][], chance: number, randomFunction: Function, fillValue: number): void {
    if (!map || !map.length || !map[0] || !map[0].length) {
      return;
    }

    let isFunction = typeof fillValue === 'function';
    let n = map.length;
    let m = map[0].length;
    let count = 0;

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        // TODO: implement radius based border chance
        if (randomFunction() < chance) {
          count++;
          map[i][j] = fillValue;
        }
      }
    }
  }

  public static countNotEmptyNeighbours(map: number[][], x: number, y: number, emptyValue: number): number {
    if (!map || !map.length || !map[0] || !map[0].length) {
      return 0;
    }

    let n = map.length;
    let m = map[0].length;
    let neighbourX: number, neighbourY: number;
    let outOfBound: boolean;
    let neighbourCount = 0;

    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        // skip self
        if (i !== 0 || j !== 0) {
          neighbourX = x + i;
          neighbourY = y + j;
          outOfBound = neighbourX < 0 || neighbourY < 0 || neighbourX >= n || neighbourY >= m;

          if (outOfBound || map[neighbourX][neighbourY] !== emptyValue) {
            neighbourCount++;
          }
        }
      }
    }

    return neighbourCount;
  }

  // flood into fillMap
  public static floodFill(map: number[][], x: number, y: number, fillMap: number[][]): number {
    let n = map.length;
    let m = map[0].length;
    let filledCount = 0;
    let fill = (i: number, j: number) => {
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

  public static mapToString(map: number[][]): string {
    return map.map(col => (col.join(''))).join('\n').replace(/0/g, '·');
  }
}

export = MapHelper;
