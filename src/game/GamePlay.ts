/// <reference path="../../typings/interfaces.d.ts"/>

import Renderer = require('../render/Renderer');
import KeyboardInput = require('../utils/KeyboardInput');
import Thing = require('./Thing');
import types = require('../types');
import d2r = require('../tools/d2r');
import GameData = require('./GameData');
import Playground = require('../map/Playground');
import EasingFunctions = require('../utils/EasingFunctions');

const ThingType = types.ThingType;
const KEYS = types.KEYS;
const V3 = BABYLON.Vector3;

const ANGLE_RIGHT = 0;
const ANGLE_BOTTOM = 1.5707963267948966;
const ANGLE_LEFT = 3.141592653589793;
const ANGLE_TOP = -1.5707963267948966;

const SPEED_MIN = 2;
const SPEED_MAX = 5;

interface Path {
  x: number;
  y: number;
  z: number;
  rotation: number;
}

class GamePlay {
  renderer: Renderer;
  gameData: GameData;
  bear: Thing;
  scores = 0;

  speed = 0;

  distanceFromCell: number = 0;
  aCellPos: BABYLON.Vector3 = null;
  lastPressedNavigationKey = null;
  agentPath: Path[] = [];

  initialHives: Thing[] = [];
  bees: Thing[] = [];

  constructor(gameData: GameData, renderer: Renderer) {
    this.gameData = gameData;
    this.renderer = renderer;

    this.bear = this.gameData.things.filter(t => (t.type === ThingType.BEAR))[0];
    this.initialHives = this.gameData.things.filter(t => (t.type === ThingType.HIVE));

    this.gameData.things.forEach(thing => {
      this.renderer.addThingView(thing);
    });

    // set initial agent location
    this.aCellPos = this.bear.position.clone();

    KeyboardInput.getObservable.forEach(key => {
      switch (key) {
        // navigation
        case KEYS.RIGHT:
          this.lastPressedNavigationKey = key;
          break;
        case KEYS.LEFT:
          this.lastPressedNavigationKey = key;
          break;
        case KEYS.UP:
          // this.speed (TODO: remove for production)
          this.speed += 1;
          break;
        case KEYS.DOWN:
          this.speed -= 1;
          break;
        case KEYS.M:
          // this.speed (TODO: remove for production)
          this.renderer.switchCameras();
          break;
        case KEYS.D:
          // this.speed (TODO: remove for production)
          if (this.renderer.scene.debugLayer.isVisible())
            this.renderer.scene.debugLayer.hide();
          else
            this.renderer.scene.debugLayer.show();
          break;
        default:
      }

      console.log('speed:', this.speed);
    });


    let bearAniDirection = 1;
    let bearAniPos = 0;
    let bearRFoot = this.renderer.scene.getMeshByID('bearRFoot');
    let bearLFoot = this.renderer.scene.getMeshByID('bearLFoot');
    // lFoot.rotation.z = .4;
    let bearRHand = this.renderer.scene.getMeshByID('bearRHand');
    // rHand.rotation.x = .4;
    let bearLHand = this.renderer.scene.getMeshByID('bearLHand');


    this.renderer.engine.runRenderLoop(() => {
      this.renderer.stats.begin();

      let sec = this.renderer.engine.getDeltaTime() / 1000;

      // <BEAR_ANIMATION>
      if (bearAniPos > 1) {
        bearAniPos = 1;
        bearAniDirection = -bearAniDirection;
      } else if (bearAniPos < -1) {
        bearAniPos = -1;
        bearAniDirection = -bearAniDirection;
      }

      let speedProc = (this.speed - SPEED_MIN) / (SPEED_MAX - SPEED_MIN);
      bearAniPos += (sec * bearAniDirection) * (10 + speedProc * 10);

      bearRHand.rotation.x = (bearAniPos * .5);
      bearLHand.rotation.x = (bearAniPos * .5);
      bearRFoot.rotation.z = (bearAniPos * .5);
      bearLFoot.rotation.z = -(bearAniPos * .5);
      // </BEAR_ANIMATION>

      // setTimeout(() => {
      //   console.log(this.agent.position);
      // }, 2000);

      this.simulate(sec, this.bear, this.gameData.playground);
      this.renderer.scene.render();

      this.renderer.stats.end();
    });

    this.updateSpeed();
  }

  simulate(sec: number, agent: Thing, playground: Playground) {
    let distance = sec * this.speed;
    this.distanceFromCell += distance;
    this.shiftAgent(agent, playground.map, this.gameData.thingMap, playground.map3d);
  }

  updateSpeed() {
    let hiveCount = this.initialHives.length;
    let beeCount = this.bees.length;
    let t = beeCount / (hiveCount * .666);

    // 66.6% bees = 100% speed = (2 + 3) cell/sec
    this.speed = SPEED_MIN + EasingFunctions.easeOutQuad(t > 1 ? 1 : t) * (SPEED_MAX - SPEED_MIN);
    console.log(this.speed);
  }

  shiftAgent(agent: Thing, map: number[][], thingMap: Thing[][], map3d: Map3DCell[][]) {
    let agentRotationY = agent.rotation.y;
    let distanceFromCell = this.distanceFromCell;
    let x: number, y: number, z: number, pos3d: Map3DCell;
    let cellX: number, cellY: number, cellZ: number, pos: BABYLON.Vector3;

    cellX = this.aCellPos.x;
    cellY = this.aCellPos.y;
    cellZ = this.aCellPos.z;
    pos3d = map3d[cellX][cellZ]

    if (this.distanceFromCell < 1) {

      //
      // update agent mesh position
      //

      let nextPos = this.aCellPos.clone();

      // update X, Y, Z
      if (agentRotationY === ANGLE_RIGHT) {
        nextPos.x += distanceFromCell;
        nextPos.y += pos3d.directionRight.y * distanceFromCell;

      } else if (agentRotationY === ANGLE_BOTTOM) {
        nextPos.z -= distanceFromCell;
        nextPos.y += pos3d.directionBottom.y * distanceFromCell;

      } else if (agentRotationY === ANGLE_LEFT) {
        nextPos.x -= distanceFromCell;
        nextPos.y += pos3d.directionLeft.y * distanceFromCell;

      } else if (agentRotationY === ANGLE_TOP) {
        nextPos.z += distanceFromCell;
        nextPos.y += pos3d.directionTop.y * distanceFromCell;

      } else debugger;

      // apply update
      pos = agent.position;
      pos.x = nextPos.x;
      pos.y = nextPos.y;
      pos.z = nextPos.z;

      agent.rotation.y = agentRotationY;

      //
      // update party mesh position
      //

      for (let i = 0, l = this.bees.length, pathLength = this.agentPath.length; i < l; i++) {
        // prev as agent.current cell
        let pathCell = this.agentPath[pathLength - 1 - (i + 1)];
        let member = this.bees[i];
        let pathRotation = pathCell.rotation;
        x = pathCell.x;
        y = pathCell.y;
        z = pathCell.z;
        pos = member.position;

        // update direction and position on pg
        if (pathRotation === ANGLE_RIGHT) {
          pos.x = x + distanceFromCell;
          pos.y = y + map3d[x][z].directionRight.y * distanceFromCell;
          pos.z = z;
          member.rotation.y = pathRotation;

        } else if (pathRotation === ANGLE_BOTTOM) {
          pos.x = x;
          pos.y = y + map3d[x][z].directionBottom.y * distanceFromCell;
          pos.z = z - distanceFromCell;
          member.rotation.y = pathRotation;

        } else if (pathRotation === ANGLE_LEFT) {
          pos.x = x - distanceFromCell;
          pos.y = y + map3d[x][z].directionLeft.y * distanceFromCell;
          pos.z = z;
          member.rotation.y = pathRotation;

        } else if (pathRotation === ANGLE_TOP) {
          pos.x = x;
          pos.y = y + map3d[x][z].directionTop.y * distanceFromCell;
          pos.z = z + distanceFromCell;
          member.rotation.y = pathRotation;

        } else debugger;
      }

    } else {

      //
      // 1. move 1 cell to the direction
      //

      thingMap[this.aCellPos.x][this.aCellPos.z] = null;

      // used switch to use integers
      if (agentRotationY === ANGLE_RIGHT)       this.aCellPos.x++;
      else if (agentRotationY === ANGLE_BOTTOM) this.aCellPos.z--;
      else if (agentRotationY === ANGLE_LEFT)   this.aCellPos.x--;
      else if (agentRotationY === ANGLE_TOP)    this.aCellPos.z++;
      else debugger;

      this.aCellPos.y = map3d[this.aCellPos.x][this.aCellPos.z].pos.y;

      distanceFromCell -= 1;
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

        console.log('new direction:', agentRotationY * 180/Math.PI);

        agent.rotation.y = agentRotationY;
        this.lastPressedNavigationKey = null;

      } else {
        // update only if free TODO: found workaround
        thingMap[this.aCellPos.x][this.aCellPos.z] = agent;
      }

      // update agent path
      this.agentPath.push({
        x: this.aCellPos.x,
        y: this.aCellPos.y,
        z: this.aCellPos.z,
        rotation: agentRotationY,
      });

      //
      // check collision
      //

      let nextCell = this.aCellPos.clone();
      if (agentRotationY === ANGLE_RIGHT)       nextCell.x++;
      else if (agentRotationY === ANGLE_BOTTOM) nextCell.z--;
      else if (agentRotationY === ANGLE_LEFT)   nextCell.x--;
      else if (agentRotationY === ANGLE_TOP)    nextCell.z++;
      else debugger;

      let collidedThing = thingMap[nextCell.x][nextCell.z];
      if (collidedThing) {
        switch(collidedThing.type) {

          // hive
          case ThingType.HIVE:

          // update scores
          this.scores++;
          this.renderer.updateScoresText(this.scores);

          this.renderer.removeThingView(collidedThing);

          collidedThing.type = ThingType.BEE;
          this.renderer.addThingView(collidedThing);

          thingMap[nextCell.x][nextCell.z] = null;
          this.bees.push(collidedThing);

          this.updateSpeed();
          break;

          // wall
          case ThingType.MOUNTAIN:
          console.warn('BAAADAABOOOOOOOOM!!!', nextCell);
          break;

          // unknown thing
          default:
          debugger;
        }
      }

      //
      // move further
      //
      this.shiftAgent(agent, map, thingMap, map3d);
    }
  }

  destroy() {
    throw 'TBD';
  }

}

export = GamePlay;
