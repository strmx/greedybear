/// <reference path="../../typings/interfaces.d.ts"/>

import Renderer = require('../render/Renderer');
import KeyboardInput = require('../utils/KeyboardInput');
import Thing = require('../game/Thing');
import types = require('../types');
import d2r = require('../tools/d2r');
import GameData = require('./GameData');

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
  gameData: GameData;
  agent: Thing;
  scores = 0;
  speed = 1;
  rotation = 0;
  distanceFromCell: number = 0;
  aCellPos: BABYLON.Vector2 = new V2(0, 0);
  lastPressedNavigationKey = null;
  agentPath: Path[] = [];
  partyMembers: Thing[] = [];

  constructor(renderer: Renderer) {

    this.gameData = new GameData();
    this.agent = this.gameData.things.filter(t => (t.type === ThingType.AGENT))[0];

    // this.rotation = agent.rotation.y;
    // aCellPos: BABYLON.Vector2 = new V2(agent.position.x, agent.position.z);

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
          renderer.switchCameras();
          break;
        default:
      }
    });

    renderer.engine.runRenderLoop(() => {
      renderer.stats.begin();

      let sec = renderer.engine.getDeltaTime() / 1000;
      this.simulate(sec, this.agent, this.gameData.playground);

      // let distance = (delta * speed) / 1000;
      // distanceFromCell += distance;
      // shiftAgent();

      renderer.scene.render();
      renderer.stats.end();
    });
  }

  simulate(sec: number, agent: Thing, palyground: Playground) {
    let distance = sec * this.speed;
    this.distanceFromCell += distance;
    this.shiftAgent(agent, palyground.map);
  }

  shiftAgent(agent: Thing, map: number[][]) {
    if (this.distanceFromCell < 1) {

      //
      // update agent mesh position
      //

      let nextPos = this.aCellPos.clone();

      if (this.rotation === ANGLE_RIGHT)       nextPos.x = this.aCellPos.x + this.distanceFromCell;
      else if (this.rotation === ANGLE_BOTTOM) nextPos.y = this.aCellPos.y - this.distanceFromCell;
      else if (this.rotation === ANGLE_LEFT)   nextPos.x = this.aCellPos.x - this.distanceFromCell;
      else if (this.rotation === ANGLE_TOP)    nextPos.y = this.aCellPos.y + this.distanceFromCell;
      else debugger;

      agent.x = nextPos.x;
      agent.y = nextPos.y;
      agent.rotation = this.rotation;

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
          member.x = pathCell.x + this.distanceFromCell;
          member.y = pathCell.y;
          member.rotation = pathRotation;
        } else if (pathRotation === ANGLE_BOTTOM) {
          member.x = pathCell.x;
          member.y = pathCell.y - this.distanceFromCell;
          member.rotation = pathRotation;
        } else if (pathRotation === ANGLE_LEFT) {
          member.x = pathCell.x - this.distanceFromCell;
          member.y = pathCell.y;
          member.rotation = pathRotation;
        } else if (pathRotation === ANGLE_TOP) {
          member.x = pathCell.x;
          member.y = pathCell.y + this.distanceFromCell;
          member.rotation = pathRotation;
        } else debugger;
      }

    } else {

      //
      // 1. move 1 cell to the direction
      //

      // used switch to use integers
      if (this.rotation === ANGLE_RIGHT)       this.aCellPos.x++;
      else if (this.rotation === ANGLE_BOTTOM) this.aCellPos.y--;
      else if (this.rotation === ANGLE_LEFT)   this.aCellPos.x--;
      else if (this.rotation === ANGLE_TOP)    this.aCellPos.y++;
      else debugger;

      this.distanceFromCell -= 1;

      //
      // apply navigation change (afte keypress)
      //
      if (this.lastPressedNavigationKey !== null) {
        switch (this.lastPressedNavigationKey) {
          case KEYS.LEFT:
            if (this.rotation === ANGLE_RIGHT)       this.rotation = ANGLE_TOP;
            else if (this.rotation === ANGLE_BOTTOM) this.rotation = ANGLE_RIGHT;
            else if (this.rotation === ANGLE_LEFT)   this.rotation = ANGLE_BOTTOM;
            else if (this.rotation === ANGLE_TOP)    this.rotation = ANGLE_LEFT;
            else debugger;
            break;
          case KEYS.RIGHT:
            if (this.rotation === ANGLE_RIGHT)       this.rotation = ANGLE_BOTTOM;
            else if (this.rotation === ANGLE_BOTTOM) this.rotation = ANGLE_LEFT;
            else if (this.rotation === ANGLE_LEFT)   this.rotation = ANGLE_TOP;
            else if (this.rotation === ANGLE_TOP)    this.rotation = ANGLE_RIGHT;
            else debugger;
            break;
        }
        this.lastPressedNavigationKey = null;
      }

      // update agent path
      this.agentPath.push({
        x: this.aCellPos.x,
        y: this.aCellPos.y,
        rotation: this.rotation,
      });

      //
      // check collision
      //

      let nextCell = this.aCellPos.clone();
      if (this.rotation === ANGLE_RIGHT)       nextCell.x++;
      else if (this.rotation === ANGLE_BOTTOM) nextCell.y--;
      else if (this.rotation === ANGLE_LEFT)   nextCell.x--;
      else if (this.rotation === ANGLE_TOP)    nextCell.y++;
      else debugger;

      let cellObjectType = map[nextCell.x][nextCell.y];
      if (cellObjectType === 1) {
        console.log('collision on', nextCell);
      } else if (cellObjectType === 10) {
        // TODO: rewrite eating
        // // eat the apple
        // let apple = scene.getMeshByName(`apple${nextCell.x}:${nextCell.y}`);
        // if (!apple) {
        //   debugger;
        // }
        //
        // this.scores++;
        // updateScoresText(this.scores);
        //
        // // remove the apple from pg
        // map[nextCell.x][nextCell.y] = 0;
        // // scene.removeMesh(apple);
        //
        // // add body part
        // let memberMesh = apple;
        // memberMesh.scaling.multiplyInPlace(new V3(.75, .75, .75));
        // memberMesh.name = 'team-member-' + this.partyMembers.length;
        // // scene.addMesh(memberMesh);
        // this.partyMembers.push(memberMesh);
      }

      //
      // move further
      //
      this.shiftAgent(agent, map);
    }
  }

  destroy() {
    throw 'TBD';
  }

}

export = GamePlay;
