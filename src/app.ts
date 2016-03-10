/// <reference path="../typings/interfaces.d.ts"/>

import Randomizer = require('./utils/Randomizer');
import GameData = require('./game/GameData');
import GamePlay = require('./game/GamePlay');
import Renderer = require('./render/Renderer');
import CanvasElement = require('./render/CanvasElement');

const gameOptions = {
  n: 64,
  m: 64,
  wallChance: .4,
  stepCount: 2,
  // nextReal: Randomizer.generateNextRealFunction(13),
  birthLimit: 4,
  deathLimit: 3,
  maxHeight: 0
};

(<any>window).nextReal = Math.random;

let gameData = new GameData(gameOptions);


// <TEST-ELEVATION>

  // let playground = gameData.playground;
  // let canvas = new CanvasElement(document.body);
  // canvas.resize();
  // let context = canvas.element.getContext('2d');
  // let imageData = context.createImageData(playground.map.length, playground.map[0].length);
  // imageData.data.set(playground.elevations);
  // context.putImageData(imageData, 0, 0);
  // return;

// </TEST-ELEVATION>


let renderer = new Renderer(gameData.playground);
let gameplay = new GamePlay(gameData, renderer);
