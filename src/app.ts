import Game = require('./Game');
import CanvasElement = require('./CanvasElement');

// let game = new Game(new CanvasElement(document.body));

//
// map generator test
//

import Randomizer = require('./utils/Randomizer');
import CaveGenerator = require('./map/CaveGenerator');
import MapHelper = require('./map/MapHelper');

let canvas = new CanvasElement(document.body);
canvas.resize();

const CELL_SIZE = 4;
let generatorOptions = {
  n: 32, //~~(canvas.element.width / CELL_SIZE),
  m: 32, //~~(canvas.element.height / CELL_SIZE),
  // nextReal: Math.random,
  nextReal: Randomizer.generateNextRealFunction(13),
  birthLimit: 4,
  deathLimit: 3,
};
let caveMap = CaveGenerator.generateCaveLikeMap(generatorOptions);

console.log(MapHelper.stringifyMap(caveMap));

CaveGenerator.removeSmallOpenAreas(caveMap);
console.log(MapHelper.stringifyMap(caveMap));

// draw
// CaveGenerator.redrawMap(caveMap, canvas.element, CELL_SIZE);
