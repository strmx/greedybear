import PatternHelper = require('./PatternHelper');

enum CELL_TYPE {
  WALL = 1,
  ROAD = 0,
};

// const DEFAULT_OPTIONS = {
//   n: 100,
//   m: 100,
//   wallChance: .4,
//   stepCount: 2,
//   birthLimit: 4,
//   deathLimit: 3,
// };

class CavePatternGenerator {

  static CELL_TYPE: CELL_TYPE

  static generateCavePattern(options: GameDataOptions): number[][] {
    const nextReal = (<any>window).nextReal;
    let pattern = PatternHelper.createFilled(options.n, options.m, CELL_TYPE.ROAD);
    PatternHelper.fillUniform(pattern, options.wallChance, nextReal, CELL_TYPE.WALL);

    for (let i=0; i<options.stepCount; i++) {
      pattern = CavePatternGenerator.applyCAStep(pattern, options.birthLimit, options.deathLimit);
    }

    return pattern;
  }

  // Cellular Automaton Step
  static applyCAStep(pattern: number[][], birthLimit: number, deathLimit: number): number[][] {
    if (!pattern || !pattern.length || !pattern[0] || !pattern[0].length) {
      return null;
    }

    let n = pattern.length;
    let m = pattern[0].length;
    let neighbourCount = 0;
    let nextStepPattern = PatternHelper.createFilled(n, m, 0);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {

        neighbourCount = PatternHelper.countNotEmptyNeighbours(pattern, i, j);

        if(pattern[i][j] === CELL_TYPE.WALL) {
          if(neighbourCount < deathLimit) {
            nextStepPattern[i][j] = CELL_TYPE.ROAD;
          } else {
            nextStepPattern[i][j] = CELL_TYPE.WALL;
          }
        } else {
          if(neighbourCount > birthLimit) {
            nextStepPattern[i][j] = CELL_TYPE.WALL;
          } else {
            nextStepPattern[i][j] = CELL_TYPE.ROAD;
          }
        }
      }
    }

    return nextStepPattern;
  }
}

export = CavePatternGenerator;
