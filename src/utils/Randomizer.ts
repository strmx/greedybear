/// <reference path="../../typings/interfaces.d.ts"/>

// use vendors - https://github.com/ckknight/random-js

class Randomizer {
  constructor() {}
  static generateNextIntFunction(min : number, max : number, seed : number) : Function {
    let randomEngine = Random.engines.mt19937().seed(seed);
    let distribution = Random.integer(min, max);

    return () => (distribution(randomEngine));
  }
  static generateNextRealFunction(seed : number) : Function {
    let randomEngine = Random.engines.mt19937().seed(seed);
    let distribution = Random.real(0, 1, false);

    return () => (distribution(randomEngine));
  }
};

export = Randomizer;
