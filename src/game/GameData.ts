/// <reference path="../../typings/Interfaces.d.ts" />

import Thing = require('./Thing');
import Playground = require('../map/Playground');
import PatternHelper = require('../map/PatternHelper');
import types = require('../types');

const V3 = BABYLON.Vector3;
const ThingType = types.ThingType;

function correctOutOfBounds(thing: Thing, realScale: number, viewScale: number, n: number, m: number): void {
  if (thing.position.y < 0) {
    if (viewScale > realScale) {
      let x = thing.position.x;
      let z = thing.position.z;
      thing.position.y = thing.pos0.y = 0;
      thing.scaling.x = thing.scaling.z = realScale;
    }
  }
}

class GameData {
  spec: GameDataOptions
  playground: Playground
  things: Thing[]
  thingMap: Thing[][]

  constructor(spec: GameDataOptions, playground: Playground) {
    this.spec = spec;
    this.playground = playground;
  }

  generateThings() {
    const nextReal = (<any>window).nextReal;

    //
    // initial things
    //

    this.things = [];
    this.thingMap = PatternHelper.createFilled(this.playground.map.length, this.playground.map[0].length, null);

    // ground & walls
    const map = this.playground.map;
    const n = map.length;
    const m = map[0].length;

    // for (let i = 0; i < n; i++) {
    //   for (let j = 0; j < m; j++) {
    //     let value: number = map[i][j];
    //     let type = value === 0 ? ThingType.GROUND : ThingType.WALL;
    //     if (type === ThingType.GROUND) {
    //       let ground = new Thing(type, new V3(i, 0, j));
    //       ground.rotation.x = Math.PI / 2;
    //       this.things.push(ground);
    //     }
    //     // if (type === ThingType.WALL) {
    //     //   let wall = new Thing(type, new V3(i, .5, j));
    //     //   wall.rotation.x = Math.PI / 2;
    //     //   this.things.push(wall);
    //     //   this.thingMap[i][j] = wall;
    //     // }
    //   }
    // }


    // ground
    // let ground = new Thing(ThingType.GROUND, new V3(n / 2, 0,m / 2), n, m);
    // this.things.push(ground);


    // pyramids
    let x: number, y: number, z:number, w: number, h: number;
    this.playground.wallRects.forEach((rect2d: RectArea) => {
      let wall: Thing;
      w = rect2d.w;
      h = rect2d.h;
      x = rect2d.x;
      z = rect2d.y;
      let centerX = x + w / 2 - .5;
      let centerZ = z + h / 2 - .5;
      let scale = (w + h) / 2;
      let isOneCellSized = w === 1 && h === 1;
      y = this.playground.elevationMap[x][z].height;

      // for big objects (>1)
      if (!isOneCellSized) {
        // pyramids
        let tl = this.playground.elevationMap[x][z].height;
        let tr = this.playground.elevationMap[x + w - 1][z].height;
        let br = this.playground.elevationMap[x + w - 1][z + h - 1].height;
        let bl = this.playground.elevationMap[x][z + h - 1].height;

        y = Math.min(tl, tr, br, bl);

        // put underground
        y -= .25;
        let viewScale = scale + .25;

        wall = new Thing(ThingType.MOUNTAIN, new V3(centerX, y, centerZ));
        wall.scaling.x = wall.scaling.y = wall.scaling.z = viewScale;
        wall.scaling.y = scale * (2 + nextReal());

        correctOutOfBounds(wall, scale, viewScale, n, m);

      } else {

        if (nextReal() < .5) {
          // fir
          scale = .6 + (nextReal() * .6);
          wall = new Thing(ThingType.FIR, new V3(centerX, y, centerZ));

          // put underground
          wall.position.y -= .5;

          wall.scaling.x = wall.scaling.z = scale;
          wall.scaling.y = scale * (4 + nextReal() * 3);

          correctOutOfBounds(wall, 1, scale, n, m);

          // rotate if doesn't fill full rect
          if (wall.scaling.z < 1.1 && wall.position.y > 1) {
            wall.rotation.y = (360 * nextReal()) * (Math.PI / 180);
          }

          wall.rotation.x = (nextReal() * 20 - 10) * (Math.PI / 180);
          wall.rotation.y = (nextReal() * 20 - 10) * (Math.PI / 180);

        } else {

          // tree
          scale = .9 + (1.5 * nextReal());
          wall = new Thing(ThingType.TREE, new V3(centerX, y, centerZ));

          // put underground
          wall.position.y -= .1;

          wall.scaling.x = wall.scaling.y = wall.scaling.z = scale;

          wall.rotation.y = (360 * nextReal()) * (Math.PI / 180);

          wall.rotation.x = (nextReal() * 20 - 10) * (Math.PI / 180);
          wall.rotation.y = (nextReal() * 20 - 10) * (Math.PI / 180);
        }
      }

      this.things.push(wall);
    });


    // agent bear
    let pos2d = this.playground.startPoints[0];
    let agentPos = new V3(pos2d.x, this.playground.elevationMap[pos2d.x][pos2d.y].height, pos2d.y);
    let agent = new Thing(ThingType.BEAR, agentPos);
    agent.scaling.x = agent.scaling.y = agent.scaling.z = 1; //1;
    this.things.push(agent);
    agent.rotation.y = 0;
    this.thingMap[agent.pos0.x][agent.pos0.z] = agent;

    // hives & bees
    this.playground.startPoints.slice(1).forEach(pos2d => {
      // agentPath should be > 1 (betwen bear and hive)
      if (Math.abs(agent.pos0.x - pos2d.x) >= 1 && Math.abs(agent.pos0.z - pos2d.y) >= 1) {
        let companion = new Thing(ThingType.HIVE, new V3(pos2d.x, this.playground.elevationMap[pos2d.x][pos2d.y].height, pos2d.y));
        companion.scaling.x = companion.scaling.y = companion.scaling.z = nextReal() * .25 + .75;
        this.thingMap[companion.pos0.x][companion.pos0.z] = companion;
        this.things.push(companion);
      }
    });
  }
}

export = GameData;
