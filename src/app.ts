/// <reference path="../typings/interfaces.d.ts"/>

import Randomizer = require('./utils/Randomizer');
import Playground = require('./map/Playground');
import GameData = require('./game/GameData');
import GamePlay = require('./game/GamePlay');
import Renderer = require('./render/Renderer');
import CanvasElement = require('./render/CanvasElement');

const gameOptions = {
  n: 64,
  m: 64,
  lakeMinSize: 10,
  lakeChance: 0.2,
  wallChance: .4,
  stepCount: 2,
  birthLimit: 4,
  deathLimit: 3,
  maxHeight: 20,
  heightInterpolationCount: 32,
};

// (<any>window).nextReal = Randomizer.generateNextRealFunction(1);
(<any>window).nextReal = Math.random;

// NEW GAME

// 1. create 2d+ playground
let playground = new Playground(gameOptions);

// 2. render environment with surface (ground)
let renderer = new Renderer(playground);

// 3. recalculate Y positions (from real surface mesh)
playground.updateElevationMap(renderer.surface);

let gameData = new GameData(gameOptions, playground);
gameData.generateThings();

let gameplay = new GamePlay(gameData, renderer);
