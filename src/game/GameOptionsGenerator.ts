/// <reference path="../../typings/Interfaces.d.ts" />

class GameOptionsGenerator {
  static generate() {
    const nextReal = (<any>window).nextReal;
    let mapSize = 20 + Math.round(nextReal() * 30);
    let maxHeight = 10 + Math.round(nextReal() * 20);

    let gameOptions = {
      n: mapSize,
      m: mapSize,
      lakeMinSize: 8 + Math.round(nextReal() * 4),
      lakeChance: nextReal() * 0.3,
      wallChance: .4,
      stepCount: 2,
      birthLimit: 4,
      deathLimit: 3,
      maxHeight:  maxHeight,
      heightInterpolationCount: 20 + Math.round(nextReal() * 20)
    };

    return gameOptions;
  }
}

export = GameOptionsGenerator;