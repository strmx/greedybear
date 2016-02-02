import PatternHelper = require('./PatternHelper');

enum CELL_TYPE {
  WALL = 1,
  ROAD = 0,
};

class CavePatternGenerator {
  static CELL_TYPE = CELL_TYPE;

  public static generateCavePattern(options: {n: number, m: number, wallChance: number, stepCount: number, nextReal: Function, birthLimit: number, deathLimit: number}): number[][] {
    let pattern = PatternHelper.createFilled(options.n, options.m, CELL_TYPE.ROAD);
    PatternHelper.fillUniform(pattern, options.wallChance, options.nextReal, CELL_TYPE.WALL);

    for (let i=0; i<options.stepCount; i++) {
      pattern = CavePatternGenerator.applyCAStep(pattern, options.birthLimit, options.deathLimit);
    }

    return pattern;
  }

  // Cellular Automaton Step
  public static applyCAStep(pattern: number[][], birthLimit: number, deathLimit: number): number[][] {
    if (!pattern || !pattern.length || !pattern[0] || !pattern[0].length) {
      return null;
    }

    let n = pattern.length;
    let m = pattern[0].length;
    let neighbourCount = 0;
    let nextStepPattern = PatternHelper.createFilled(n, m, 0);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {

        neighbourCount = PatternHelper.countNotEmptyNeighbours(pattern, i, j, CELL_TYPE.ROAD);

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
