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

let t = Date.now();

const CELL_SIZE = 1;
let generatorOptions = {
  n: 64,//~~(canvas.element.width / CELL_SIZE),
  m: 64,//~~(canvas.element.height / CELL_SIZE),
  // nextReal: Math.random,
  nextReal: Randomizer.generateNextRealFunction(3),
  birthLimit: 4,
  deathLimit: 3,
};
let caveMap = CaveGenerator.generateCaveLikeMap(generatorOptions);
console.info(Date.now() - t);

t = Date.now();
CaveGenerator.removeSmallOpenAreas(caveMap);
console.info(Date.now() - t);
console.log(MapHelper.stringifyMap(caveMap));

// draw
// CaveGenerator.redrawMap(caveMap, canvas.element, CELL_SIZE);
