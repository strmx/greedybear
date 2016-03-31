/// <reference path="../typings/interfaces.d.ts"/>

import Randomizer = require('./utils/Randomizer');
import Playground = require('./map/Playground');
import GameOptionsGenerator = require('./game/GameOptionsGenerator');
import GameData = require('./game/GameData');
import GamePlay = require('./game/GamePlay');
import Renderer = require('./render/Renderer');
import CanvasElement = require('./render/CanvasElement');


function generateNewMap() {
  let seed = (Math.round(Math.random() * 1000000000)).toString(36).toUpperCase();
  window.location.hash = seed;
  window.location.reload();
}


// PREPARE RANDOMIZER (#)

let initialHash = window.location.hash.replace(/#/g, '');

if (!initialHash) {
  generateNewMap();
}

let seed = parseInt(initialHash, 36);
(<any>window).nextReal = Randomizer.generateNextRealFunction(seed);



let first = document.querySelector('[firstScreen]');
let newMapButton = first.querySelector('[newMapButton]');
let playButton = first.querySelector('[playButton]');

newMapButton.addEventListener('click', () => {
  first.parentNode.removeChild(first);
  generateNewMap();
});

playButton.addEventListener('click', () => {
  first.parentNode.removeChild(first);
  gameplay.start();
});


// NEW GAME

let gameOptions = GameOptionsGenerator.generate();

// 1. create 2d+ playground
let playground = new Playground(gameOptions);

// 2. render environment with surface (ground)
let renderer = new Renderer(playground);

// 3. recalculate Y positions (from real surface mesh)
playground.updateElevationMap(renderer.surface);

let gameData = new GameData(gameOptions, playground);
gameData.generateThings();

let gameplay = new GamePlay(gameData, renderer);
