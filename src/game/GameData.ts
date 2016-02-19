/// <reference path="../../typings/Interfaces.d.ts" />

import Thing = require('./Thing');
import PlaygroundGenerator = require('../map/PlaygroundGenerator');
import PatternHelper = require('../map/PatternHelper');
import types = require('../types');

const ThingType = types.ThingType;

class GameData {
  playground: Playground
  things: Thing[]
  thingMap: Thing[][]

  constructor() {
    this.playground = PlaygroundGenerator.generatePlayground();

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
        this.things.push(new Thing(type, i, j));
      }
    }

    // agent
    let agentPos = this.playground.startPoints[0];
    this.things.push(new Thing(ThingType.AGENT, agentPos.x, agentPos.y));

    // companions
    this.playground.startPoints.slice(1).forEach(pos => {
      let companion = new Thing(ThingType.COMPANION, pos.x, pos.y);
      this.thingMap[pos.x][pos.y] = companion;
      this.things.push(companion);
    });
  }
}

export = GameData;
