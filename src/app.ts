import Game = require('./Game');
import CanvasElement = require('./CanvasElement');

// let game = new Game(new CanvasElement(document.body));

//
// map generator test
//

import Randomizer = require('./utils/Randomizer');
import CaveGenerator = require('./map/CaveGenerator');
import PatternHelper = require('./map/PatternHelper');

let canvas = new CanvasElement(document.body);
canvas.resize();

let t = Date.now();

const CELL_SIZE = 1;
let generatorOptions = {
  n: 160,//~~(canvas.element.width / CELL_SIZE),
  m: 40,//~~(canvas.element.height / CELL_SIZE),
  wallChance: .4,
  stepCount: 2,
  // nextReal: Math.random,
  nextReal: Randomizer.generateNextRealFunction(0),
  birthLimit: 4,
  deathLimit: 3,
};
let caveMap = CaveGenerator.generateCaveLikeMap(generatorOptions);
console.info(Date.now() - t);



t = Date.now();
CaveGenerator.removeSmallOpenAreas(caveMap);
console.info(Date.now() - t);



t = Date.now();
let positions = PatternHelper.collectFreeAroundPositions(caveMap, 0);
console.info(Date.now() - t);

positions.forEach(p => {
  caveMap[p.x][p.y] = Math.round(p.distance) + 3;
});

console.log(positions[0].distance, positions.length);
let tm = PatternHelper.stringifyMap(caveMap)
          .split('')
          .map(s => {
            let d = parseInt(s, 10);
            if (d > 0) return d - 3;
            return s;
          })
          .join('');


console.log(tm);



// draw
// CaveGenerator.redrawMap(caveMap, canvas.element, CELL_SIZE);
