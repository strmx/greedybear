import Randomizer = require('../utils/Randomizer');

enum CELL_TYPE {
  WALL = 1,
  ROAD = 0,
};

interface Point {
  x: number;
  y: number;
}

class DistancePoint {
  constructor(public x: number, public y: number, public distance: number) {}
}

class FreeAroundPoint implements DistancePoint {
  constructor(public x: number, public y: number, public radius: number, public distance: number) {}
  distanceTo(point: FreeAroundPoint) {
    let dx = point.x - this.x;
    let dy = point.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

class Bypass {
  public radiusLimit: number;
  public points: FreeAroundPoint[] = [];

  constructor(radiusLimit: number) {
    this.radiusLimit = radiusLimit;
    this.generateBypassShifts();
  }

  public get length(): number {
    return this.points.length;
  }

  /*
    89->.
    .012.
    .7 3.
    .654.
    .....
  */
  private generateBypassShifts(): void {
    let radiusLimit = this.radiusLimit;
    let cx: number, cy: number;

    for (let radius = 1; radius < radiusLimit; radius++) {
      // TL->TR
      cy = -radius;
      for (cx = -radius; cx <= radius; cx++) this.points.push(new FreeAroundPoint(cx, cy, radius, Math.sqrt(cx * cx + cy * cy)));
      // TR->BR
      cx = radius;
      for (cy = -radius + 1; cy <= radius; cy++) this.points.push(new FreeAroundPoint(cx, cy, radius, Math.sqrt(cx * cx + cy * cy)));
      // BR->BL
      cy = radius;
      for (cx = radius - 1; cx >= -radius; cx--) this.points.push(new FreeAroundPoint(cx, cy, radius, Math.sqrt(cx * cx + cy * cy)));
      // BL->TL
      cx = -radius;
      for (cy = radius - 1; cy >= -radius + 1; cy--) this.points.push(new FreeAroundPoint(cx, cy, radius, Math.sqrt(cx * cx + cy * cy)));
    }
  }
}

class PatternHelper {
  public static createFilled(n: number, m: number, defautValue: any): any[][] {
    let isFunction = typeof defautValue === 'function';
    let pattern = [];
    let count = 0;

    for (let i = 0; i < n; i++) {
      let col = [];
      pattern[i] = col;
      for (let j = 0; j < m; j++) {
        count++;
        col[j] = defautValue;
      }
    }
    return pattern;
  }

  public static fillUniform(pattern: number[][], chance: number, randomFunction: Function, fillValue: number): void {
    if (!pattern || !pattern.length || !pattern[0] || !pattern[0].length) {
      return;
    }

    let isFunction = typeof fillValue === 'function';
    let n = pattern.length;
    let m = pattern[0].length;
    let count = 0;

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        // TODO: implement radius based border chance
        if (randomFunction() < chance) {
          count++;
          pattern[i][j] = fillValue;
        }
      }
    }
  }

  public static countNotEmptyNeighbours(pattern: number[][], x: number, y: number, emptyValue: number): number {
    if (!pattern || !pattern.length || !pattern[0] || !pattern[0].length) {
      return 0;
    }

    let n = pattern.length;
    let m = pattern[0].length;
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

          if (outOfBound || pattern[neighbourX][neighbourY] !== emptyValue) {
            neighbourCount++;
          }
        }
      }
    }

    return neighbourCount;
  }

  // flood into fillPattern (w/o diagonal)
  public static floodFill(pattern: number[][], x: number, y: number, emptyValue: number, checkedPattern: boolean[][]): Point[] {
    let filledCells: Point[] = [];
    let n = pattern.length;
    let m = pattern[0].length;
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
          if (checkedPattern[cx][cy] === false && pattern[cx][cy] === emptyValue) {
            // mark as flooded
            checkedPattern[cx][cy] = true;
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

  public static calculateFreeAroundRadius(x: number, y: number, pattern: number[][], emptyValue: number, bypass: Bypass): number {
    let n = pattern.length;
    let m = pattern[0].length;
    let bPoint: FreeAroundPoint;
    let cx: number, cy: number;
    let checkCollision = (x: number, y: number) => {
      return (cx < 0 || cy < 0 || cx >= n || cy >= m) || (pattern[cx][cy] !== emptyValue)
    };

    for (let i=0, l=bypass.length; i < l; i++) {
      bPoint = bypass.points[i];
      cx = x + bPoint.x;
      cy = y + bPoint.y;

      if (checkCollision(cx, cy)) {
        let nearestPoint = bPoint;
        // check other point with same radius
        for (let j = i + 1; j < l; j++) {
          bPoint = bypass.points[j];
          if (bPoint.radius === nearestPoint.radius) {
            cx = x + bPoint.x;
            cy = y + bPoint.y;
            if (checkCollision(cx, cy)) {
              if (bPoint.distance < nearestPoint.distance) {
                nearestPoint = bPoint;
              }
            }
          } else {
            return nearestPoint.distance;
          }
        }
      }
    }
    return 0;
  }

  public static collectFreeAroundPositions(pattern: number[][], emptyValue: number): DistancePoint[] {
    let n = pattern.length;
    let m = pattern[0].length;
    let freeAroundPositions: DistancePoint[] = [];
    let removedAroundPositions: DistancePoint[] = [];
    let bypass = new Bypass(Math.max(n, m));

    // calculate radius for all free points
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        if (pattern[i][j] === emptyValue) {
          let distance = PatternHelper.calculateFreeAroundRadius(i, j, pattern, emptyValue, bypass);
          // filter small free areas
          if (distance > 1) {
            freeAroundPositions.push(new DistancePoint(i, j, distance));
          }
        }
      }
    }

    // biggest radius first
    freeAroundPositions.sort((a, b) => (b.distance - a.distance));

    // eat smaller points
    let p1: DistancePoint, p2: DistancePoint;
    let distanceTillCollision, dx, dy, distanceBetweenPoints;
    for (let i = 0, l = freeAroundPositions.length; i < l; i++) {
      if (freeAroundPositions[i]) {
        p1 = freeAroundPositions[i];
        distanceTillCollision = p1.distance;

        for (let j = i + 1; j < l; j++) {
          if (freeAroundPositions[j]) {
            p2 = freeAroundPositions[j];
            dx = p2.x - p1.x;
            dy = p2.y - p1.y;
            distanceBetweenPoints = Math.sqrt(dx * dx + dy * dy);
            if (distanceBetweenPoints < distanceTillCollision) {
              // eat it
              removedAroundPositions[j] = p2;
              freeAroundPositions[j] = null;
            }
          }
        }
      }
    }

    // clear position list
    let positions = [];
    let point: DistancePoint;
    for (let i = 0, l = freeAroundPositions.length; i < l; i++) {
      point = freeAroundPositions[i];
      if (point) {
        positions.push(point);
      }
    }

    return positions;
  }

  // return sorted by size list of open areas
  public static findOpenAreas(pattern: number[][], emptyValue: number): Point[][] {
    let n = pattern.length;
    let m = pattern[0].length;
    let openAreas = [];
    let checkedPattern = PatternHelper.createFilled(n, m, false);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        if (checkedPattern[i][j] === false && pattern[i][j] === emptyValue) {
          let area = PatternHelper.floodFill(pattern, i, j, emptyValue, checkedPattern);
          openAreas.push(area);
        }
      }
    }

    // sort by size
    openAreas.sort((a, b) => (b.length - a.length));

    return openAreas;
  }

  // leave only biggest one on arg: pattern
  // returns list of open area cells
  public static removeSmallOpenAreas(pattern: number[][]): {x: number, y:number}[] {
    let openAreas = PatternHelper.findOpenAreas(pattern, CELL_TYPE.ROAD);

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
            pattern[pos.x][pos.y] = CELL_TYPE.WALL;
          });
        });
    }

    return openAreas[0];
  }

  public static clone(pattern: any[][]): any[][] {
    return pattern.map(col => (col.map(cell => (cell))));
  }

  public static stringify(pattern: number[][]): string {
    let transposedPattern = pattern[0].map(function(col, i) {
      return pattern.map(function(row) {
        return row[i];
      });
    });
    return transposedPattern.map(col => (col.join(''))).join('\n')
            .replace(/0/g, '░')
            .replace(/1/g, '█');
  }

  public static parse(text: string): number[][] {
    let rows = text.split('\n');
    if (!rows.length || !rows[0] || !rows[0].length) {
      return null;
    }

    let n = rows[0].length;
    let m = rows.length;
    let pattern = PatternHelper.createFilled(n, m, 0);
    rows.forEach((rows, j) => {
      rows.split('').forEach((val, i) => {
        let cellValue: number;
        if (val === '░') cellValue = 0;
        else if (val === '█') cellValue = 1;
        else cellValue = parseInt(val, 10);

        pattern[i][j] = cellValue;
      });
    });

    return pattern;
  }
}

export = PatternHelper;
