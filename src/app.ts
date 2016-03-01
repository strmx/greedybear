/// <reference path="../typings/interfaces.d.ts"/>

import GameData = require('./game/GameData');
import GamePlay = require('./game/GamePlay');
import Renderer = require('./render/Renderer');
import CanvasElement = require('./render/CanvasElement');


let gameData = new GameData();


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
