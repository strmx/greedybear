import Game = require('./Game');
import CanvasElement = require('./CanvasElement');



//////////////////////
// MAP GENERATION
////////////////////



import Randomizer = require('./utils/Randomizer');
import CavePatternGenerator = require('./map/CavePatternGenerator');
import PatternHelper = require('./map/PatternHelper');

let t = Date.now();

let generatorOptions = {
  n: 20,
  m: 20,
  wallChance: .4,
  stepCount: 2,
  nextReal: Randomizer.generateNextRealFunction(0), //Math.random,
  birthLimit: 4,
  deathLimit: 3,
};
let pattern = CavePatternGenerator.generateCavePattern(generatorOptions);
console.info(Date.now() - t);



t = Date.now();
PatternHelper.removeSmallOpenAreas(pattern);
console.info(Date.now() - t);



t = Date.now();
let positions = PatternHelper.collectFreeAroundPositions(pattern);
console.info(Date.now() - t);

positions.forEach(p => {
  pattern[p.x][p.y] = Math.round(p.distance) + 3;
});

console.log(positions[0].distance, positions.length);
let tm = PatternHelper.stringify(pattern)
          .split('')
          .map(s => {
            let d = parseInt(s, 10);
            if (d > 0) return d - 3;
            return s;
          })
          .join('');

console.log(tm);



//////////////////////
// RENDER
////////////////////



let game = new Game(new CanvasElement(document.body), pattern);
let canvas = new CanvasElement(document.body);
canvas.resize();



// draw
// CaveGenerator.redrawMap(caveMap, canvas.element, CELL_SIZE);
// public static redrawMap(pattern: number[][], canvas: HTMLCanvasElement, cellSize: number): void {
//   let n = pattern.length;
//   let m = pattern[0].length;
//   let ctx = canvas.getContext('2d');
//
//   ctx.fillStyle = '#996633';
//   ctx.fillRect(0, 0, canvas.width, canvas.height);
//   ctx.fillStyle = '#000';
//
//   for (let i = 0; i < n; i++) {
//     for (let j = 0; j < m; j++) {
//       if (pattern[i][j] === CELL_TYPE.WALL) {
//         ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
//       }
//     }
//   }
// }
