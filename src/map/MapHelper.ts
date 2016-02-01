import Randomizer = require('../utils/Randomizer');

class MapHelper {
  public static cloneMap(map: any[][]): any[][] {
    return map.map(col => (col.map(cell => (cell))));
  }

  public static createFilledMap(n: number, m: number, defautValue: any): any[][] {
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

  // flood into fillMap (w/o diagonal)
  public static floodFill(map: number[][], x: number, y: number, emptyValue: number, checkedMap: boolean[][]): {x: number, y: number}[] {
    let filledCells: {x: number, y: number}[] = [];
    let n = map.length;
    let m = map[0].length;
    let i: number, j: number, cx: number, cy: number;

    let cellsToCheckX = [x];
    let cellsToCheckY = [y];
    let newCellsToCheckX = [];
    let newCellsToCheckY = [];

    while(cellsToCheckX.length) {
      newCellsToCheckX = [];
      newCellsToCheckY = [];

      for (i=cellsToCheckX.length - 1; i >= 0; i--) {
        cx = cellsToCheckX[i];
        cy = cellsToCheckY[i];

        if (cx >= 0 && cy >= 0 && cx < n && cy < m) {
          // if empty and was not checked before
          if (checkedMap[cx][cy] === false && map[cx][cy] === emptyValue) {
            // mark as flooded
            checkedMap[cx][cy] = true;
            filledCells.push({x: cx, y: cy});
            // check top
            newCellsToCheckX.push(cx);
            newCellsToCheckY.push(cy - 1);
            // check right
            newCellsToCheckX.push(cx + 1);
            newCellsToCheckY.push(cy);
            // check bottom
            newCellsToCheckX.push(cx);
            newCellsToCheckY.push(cy + 1);
            // check left
            newCellsToCheckX.push(cx - 1);
            newCellsToCheckY.push(cy);
          }
        }
      }

      cellsToCheckX = newCellsToCheckX;
      cellsToCheckY = newCellsToCheckY;
    }

    return filledCells;
  }

  // return sorted by size list of open areas
  public static findOpenAreas(map: number[][], emptyValue: number): {x: number, y: number}[][] {
    let n = map.length;
    let m = map[0].length;
    let openAreas = [];
    let checkedMap = MapHelper.createFilledMap(n, m, false);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        if (checkedMap[i][j] === false && map[i][j] === emptyValue) {
          let area = MapHelper.floodFill(map, i, j, emptyValue, checkedMap);
          openAreas.push(area);
        }
      }
    }

    // sort by size
    openAreas.sort((a, b) => (b.length - a.length));

    return openAreas;
  }

  public static stringifyMap(map: number[][]): string {
    let transposedMap = map[0].map(function(col, i) {
      return map.map(function(row) {
        return row[i];
      });
    });

    return transposedMap.map(col => (col.join(''))).join('\n')
            .replace(/0/g, '░')
            .replace(/1/g, '█');
  }

  public static parseMap(text: string): number[][] {
    let rows = text.split('\n');
    if (!rows.length || !rows[0] || !rows[0].length) {
      return null;
    }

    let n = rows[0].length;
    let m = rows.length;
    let map = MapHelper.createFilledMap(n, m, 0);
    rows.forEach((rows, j) => {
      rows.split('').forEach((val, i) => {
        let cellValue: number;
        if (val === '░') cellValue = 0;
        else if (val === '█') cellValue = 1;
        else cellValue = parseInt(val, 10);

        map[i][j] = cellValue;
      });
    });

    return map;
  }
}

export = MapHelper;
