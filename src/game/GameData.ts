/// <reference path="../../typings/Interfaces.d.ts" />

import Thing = require('./Thing');
import Playground = require('../map/Playground');
import PatternHelper = require('../map/PatternHelper');
import types = require('../types');

const V3 = BABYLON.Vector3;
const ThingType = types.ThingType;

class GameData {
  playground: Playground
  things: Thing[]
  thingMap: Thing[][]

  constructor() {
    this.playground = new Playground();

    //
    // initial things
    //

    this.things = [];
    this.thingMap = PatternHelper.createFilled(this.playground.map.length, this.playground.map[0].length, null);

    // sky
    this.things.push(new Thing(ThingType.SKY));

    // ground & walls
    const map = this.playground.map;
    const n = map.length;
    const m = map[0].length;

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        let value: number = map[i][j];
        let type = value === 0 ? ThingType.GROUND : ThingType.WALL;
        if (type === ThingType.GROUND) {
          let ground = new Thing(type, new V3(i, 0, j));
          ground.rotation.x = Math.PI / 2;
          this.things.push(ground);
        }
        // if (type === ThingType.WALL) {
        //   let wall = new Thing(type, new V3(i, .5, j));
        //   wall.rotation.x = Math.PI / 2;
        //   this.things.push(wall);
        //   this.thingMap[i][j] = wall;
        // }
      }
    }

    console.log(this.playground.wallRects);
    this.playground.wallRects.forEach((rect: RectArea) => {
      let centerX = rect.x + rect.w / 2 - .5;
      let centerY = rect.y + rect.h / 2 - .5;
      let scale = (rect.w + rect.h) / 2;
      let wall = new Thing(ThingType.WALL, new V3(centerX, 0, centerY));
      wall.scaling.x = wall.scaling.y = wall.scaling.z = scale;
      this.things.push(wall);
      // this.thingMap[centerX][centerY] = wall;
    });

    // agent
    let agentPos = this.playground.startPoints[0];
    let agent = new Thing(ThingType.AGENT, new V3(agentPos.x, .5, agentPos.y));
    this.things.push(agent);
    agent.rotation.y = 0;
    this.thingMap[agent.pos0.x][agent.pos0.z] = agent;

    // companions
    this.playground.startPoints.slice(1).forEach(pos => {
      let companion = new Thing(ThingType.COMPANION, new V3(pos.x, .5, pos.y));
      this.thingMap[companion.pos0.x][companion.pos0.z] = companion;
      this.things.push(companion);
    });
  }
}

export = GameData;
