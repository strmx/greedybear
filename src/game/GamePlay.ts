/// <reference path="../../typings/interfaces.d.ts"/>

import Renderer = require('../render/Renderer');
import KeyboardInput = require('../utils/KeyboardInput');
import Thing = require('./Thing');
import types = require('../types');
import d2r = require('../tools/d2r');
import GameData = require('./GameData');
import Playground = require('../map/Playground');

const ThingType = types.ThingType;
const KEYS = types.KEYS;

const V2 = BABYLON.Vector2;
const V3 = BABYLON.Vector3;

const ANGLE_RIGHT = 0;
const ANGLE_BOTTOM = 1.5707963267948966;
const ANGLE_LEFT = 3.141592653589793;
const ANGLE_TOP = -1.5707963267948966;

interface Path {
  x: number;
  y: number;
  rotation: number;
}

class GamePlay {
  renderer: Renderer;
  gameData: GameData;
  agent: Thing;
  scores = 0;
  speed = 1;
  distanceFromCell: number = 0;
  aCellPos: BABYLON.Vector2 = null;
  lastPressedNavigationKey = null;
  agentPath: Path[] = [];
  partyMembers: Thing[] = [];

  constructor(gameData: GameData, renderer: Renderer) {
    this.gameData = gameData;
    this.renderer = renderer;

    this.agent = this.gameData.things.filter(t => (t.type === ThingType.AGENT))[0];

    this.renderer.addGround(this.gameData.playground);

    this.gameData.things.forEach(thing => {
      this.renderer.showThing(thing);
    });

    // set initial agent location
    this.aCellPos = new V2(this.agent.position.x, this.agent.position.z);


    KeyboardInput.getObservable.forEach(key => {
      switch (key) {
        // navigation
        case KEYS.RIGHT:
          this.lastPressedNavigationKey = key;
          break;
        case KEYS.LEFT:
          this.lastPressedNavigationKey = key;
          break;
        // this.speed (TODO: remove for production)
        case KEYS.UP:
          this.speed += 1;
          break;
        case KEYS.DOWN:
          this.speed -= 1;
          break;
        case KEYS.C:
          this.renderer.switchCameras();
          break;
        default:
      }
    });

    this.renderer.engine.runRenderLoop(() => {
      this.renderer.stats.begin();

      let sec = this.renderer.engine.getDeltaTime() / 1000;
      this.simulate(sec, this.agent, this.gameData.playground);
      this.renderer.scene.render();

      this.renderer.stats.end();
    });
  }

  simulate(sec: number, agent: Thing, playground: Playground) {
    let distance = sec * this.speed;
    this.distanceFromCell += distance;
    this.shiftAgent(agent, playground.map, this.gameData.thingMap);
  }

  shiftAgent(agent: Thing, map: number[][], thingMap: Thing[][]) {
    let agentRotationY = agent.rotation.y;

    if (this.distanceFromCell < 1) {

      //
      // update agent mesh position
      //

      let nextPos = this.aCellPos.clone();

      if (agentRotationY === ANGLE_RIGHT)       nextPos.x = this.aCellPos.x + this.distanceFromCell;
      else if (agentRotationY === ANGLE_BOTTOM) nextPos.y = this.aCellPos.y - this.distanceFromCell;
      else if (agentRotationY === ANGLE_LEFT)   nextPos.x = this.aCellPos.x - this.distanceFromCell;
      else if (agentRotationY === ANGLE_TOP)    nextPos.y = this.aCellPos.y + this.distanceFromCell;
      else debugger;

      agent.position.x = nextPos.x;
      agent.position.z = nextPos.y;
      agent.rotation.y = agentRotationY;

      //
      // update party mesh position
      //

      for (let i = 0, l = this.partyMembers.length, pathLength = this.agentPath.length; i < l; i++) {
        // prev as agent.current cell
        let pathCell = this.agentPath[pathLength - 1 - (i + 1)];
        let member = this.partyMembers[i];
        let pathRotation = pathCell.rotation;

        // update direction and position on pg
        if (pathRotation === ANGLE_RIGHT) {
          member.position.x = pathCell.x + this.distanceFromCell;
          member.position.z = pathCell.y;
          member.rotation.y = pathRotation;
        } else if (pathRotation === ANGLE_BOTTOM) {
          member.position.x = pathCell.x;
          member.position.z = pathCell.y - this.distanceFromCell;
          member.rotation.y = pathRotation;
        } else if (pathRotation === ANGLE_LEFT) {
          member.position.x = pathCell.x - this.distanceFromCell;
          member.position.z = pathCell.y;
          member.rotation.y = pathRotation;
        } else if (pathRotation === ANGLE_TOP) {
          member.position.x = pathCell.x;
          member.position.z = pathCell.y + this.distanceFromCell;
          member.rotation.y = pathRotation;
        } else debugger;
      }

    } else {

      //
      // 1. move 1 cell to the direction
      //

      thingMap[this.aCellPos.x][this.aCellPos.y] = null;

      // used switch to use integers
      if (agentRotationY === ANGLE_RIGHT)       this.aCellPos.x++;
      else if (agentRotationY === ANGLE_BOTTOM) this.aCellPos.y--;
      else if (agentRotationY === ANGLE_LEFT)   this.aCellPos.x--;
      else if (agentRotationY === ANGLE_TOP)    this.aCellPos.y++;
      else debugger;

      this.distanceFromCell -= 1;

      //
      // apply navigation change (afte keypress)
      //
      if (this.lastPressedNavigationKey !== null) {
        switch (this.lastPressedNavigationKey) {
          case KEYS.LEFT:
            if (agentRotationY === ANGLE_RIGHT)       agentRotationY = ANGLE_TOP;
            else if (agentRotationY === ANGLE_BOTTOM) agentRotationY = ANGLE_RIGHT;
            else if (agentRotationY === ANGLE_LEFT)   agentRotationY = ANGLE_BOTTOM;
            else if (agentRotationY === ANGLE_TOP)    agentRotationY = ANGLE_LEFT;
            else debugger;
            break;
          case KEYS.RIGHT:
            if (agentRotationY === ANGLE_RIGHT)       agentRotationY = ANGLE_BOTTOM;
            else if (agentRotationY === ANGLE_BOTTOM) agentRotationY = ANGLE_LEFT;
            else if (agentRotationY === ANGLE_LEFT)   agentRotationY = ANGLE_TOP;
            else if (agentRotationY === ANGLE_TOP)    agentRotationY = ANGLE_RIGHT;
            else debugger;
            break;
        }

        agent.rotation.y = agentRotationY;
        this.lastPressedNavigationKey = null;

      } else {
        // update only if free TODO: found workaround
        thingMap[this.aCellPos.x][this.aCellPos.y] = agent;
      }

      // update agent path
      this.agentPath.push({
        x: this.aCellPos.x,
        y: this.aCellPos.y,
        rotation: agentRotationY,
      });

      //
      // check collision
      //

      let nextCell = this.aCellPos.clone();
      if (agentRotationY === ANGLE_RIGHT)       nextCell.x++;
      else if (agentRotationY === ANGLE_BOTTOM) nextCell.y--;
      else if (agentRotationY === ANGLE_LEFT)   nextCell.x--;
      else if (agentRotationY === ANGLE_TOP)    nextCell.y++;
      else debugger;

      let collidedThing = thingMap[nextCell.x][nextCell.y];
      if (collidedThing) {
        switch(collidedThing.type) {

          // compoanion
          case ThingType.COMPANION:
          // update scores
          this.scores++;
          this.renderer.updateScoresText(this.scores);

          thingMap[nextCell.x][nextCell.y] = null;
          this.partyMembers.push(collidedThing);
          break;

          // wall
          case ThingType.WALL:
          console.warn('BAAADAABOOM!!!', nextCell);
          break;

          // unknown thing
          default:
          debugger;
        }
      }

      //
      // move further
      //
      this.shiftAgent(agent, map, thingMap);
    }
  }

  destroy() {
    throw 'TBD';
  }

}

export = GamePlay;
