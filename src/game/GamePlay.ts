/// <reference path="../../typings/interfaces.d.ts"/>

import Renderer = require('../render/Renderer');
import KeyboardInput = require('../utils/KeyboardInput');
import FPSCounter = require('../utils/FPSCounter');
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
  isStarted: boolean = false;
  gameOverCallback: Function = null;

  fps: FPSCounter = new FPSCounter(document.querySelector('.fps strong'));
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

  updateScoresInterval: number;

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

        // resolution control
        case KEYS.ZERO:
          this.renderer.setScreenScale(1 / window.devicePixelRatio);
          break;
        case KEYS.ONE:
          this.renderer.setScreenScale(1);
          break;
        case KEYS.TWO:
          this.renderer.setScreenScale(2);
          break;
        case KEYS.THREE:
          this.renderer.setScreenScale(3);
          break;
        case KEYS.FOUR:
          this.renderer.setScreenScale(4);
          break;

        default:
      }
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
      this.fps.begin();

      let sec = this.renderer.engine.getDeltaTime() / 1000;

      if (this.isStarted) {
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

        // TODO: optimize
        if (this.bees.length) {
          bearRHand.rotation.x = (bearAniPos * .5);
          bearLHand.rotation.x = (bearAniPos * .5);
        }
        bearRFoot.rotation.z = (bearAniPos * .5);
        bearLFoot.rotation.z = -(bearAniPos * .5);
        // </BEAR_ANIMATION>

        // setTimeout(() => {
        //   console.log(this.agent.position);
        // }, 2000);

        this.simulate(sec, this.bear, this.gameData.playground);

      } else {
        this.renderer.zoomOutCamera.alpha += sec * Math.PI / 100;
      }

      this.renderer.scene.render();

      this.fps.end();
    });

    this.updateSpeed();
  }

  start(gameOverCallback: Function) {
    this.gameOverCallback = gameOverCallback;
    this.renderer.zoomIn();
    this.isStarted = true;
  }

  pause() {
    this.renderer.zoomOut();
    this.isStarted = false;
  }

  togglePause() {
    this.isStarted = !this.isStarted;
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

    // win
    if (beeCount >= hiveCount) {
      this.gameOver(false, false);
    }

    // spped up to prevent long-play boredom =)
    if (hiveCount > 100) {
      hiveCount = 100;
    }

    // 66.6% bees = 100% speed = (2 + 3) cell/sec
    this.speed = SPEED_MIN + EasingFunctions.easeOutQuad(t > 1 ? 1 : t) * (SPEED_MAX - SPEED_MIN);
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
      // update bees position
      //

      for (let i = 0, l = this.bees.length, pathLength = this.agentPath.length; i < l; i++) {
        // prev as agent.current cell
        let pathCell = this.agentPath[pathLength - 1 - (i + 1)];
        let bee = this.bees[i];
        let pathRotation = pathCell.rotation;
        x = pathCell.x;
        y = pathCell.y;
        z = pathCell.z;
        pos = bee.position;

        // update direction and position on pg
        if (pathRotation === ANGLE_RIGHT) {
          pos.x = x + distanceFromCell;
          pos.y = y + map3d[x][z].directionRight.y * distanceFromCell;
          pos.z = z;
          bee.rotation.y = pathRotation;

        } else if (pathRotation === ANGLE_BOTTOM) {
          pos.x = x;
          pos.y = y + map3d[x][z].directionBottom.y * distanceFromCell;
          pos.z = z - distanceFromCell;
          bee.rotation.y = pathRotation;

        } else if (pathRotation === ANGLE_LEFT) {
          pos.x = x - distanceFromCell;
          pos.y = y + map3d[x][z].directionLeft.y * distanceFromCell;
          pos.z = z;
          bee.rotation.y = pathRotation;

        } else if (pathRotation === ANGLE_TOP) {
          pos.x = x;
          pos.y = y + map3d[x][z].directionTop.y * distanceFromCell;
          pos.z = z + distanceFromCell;
          bee.rotation.y = pathRotation;

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

      let nextCellX = nextCell.x;
      let nextCellZ = nextCell.z;

      // out of bounds
      if (nextCellX < 0 || nextCellZ < 0 || nextCellX >= map.length || nextCellZ >= map[0].length) {
        this.gameOver(false, true);
        return;
      }

      // check collisions with static objects
      if (this.gameData.playground.boundaries[nextCellX][nextCellZ]) {
        this.gameOver(true, false);
        return;
      }

      // collide with bee
      for (let i = 0, l = Math.min(this.bees.length, this.agentPath.length), pathCount = this.agentPath.length; i < l; i++) {
        let path = this.agentPath[pathCount - 1 - (i + 1)];
        if (path.x === nextCellX && path.z === nextCellZ) {
          this.gameOver(true, false);
        }
      }

      // TODO: get rid of static object duplication check
      // e.g. walls in boundaries and in thingMap
      let collidedThing = thingMap[nextCellX][nextCellZ];
      if (collidedThing) {
        switch(collidedThing.type) {

          // hive
          case ThingType.HIVE:

          // update scores
          // Delta >= 1
          let hiveCount = this.initialHives.length;
          let beeCount = this.bees.length;
          let beeScoresDelta = beeCount / hiveCount;
          let speedScoresDelta = this.speed - SPEED_MIN + 1;

          let rawScores = Math.ceil(100 * ((1 + (beeScoresDelta * 1.5)) * speedScoresDelta));
          this.scores += rawScores - (rawScores % 10);
          this.updateScoresView();

          // this.renderer.removeThingView(collidedThing);
          this.renderer.animateHiveCollision(collidedThing);

          collidedThing.type = ThingType.BEE;
          this.renderer.addThingView(collidedThing);

          thingMap[nextCellX][nextCellZ] = null;
          this.bees.push(collidedThing);

          this.updateSpeed();
          break;

          // unknown thing (not a bee)
          default:
          this.gameOver(true, false);
        }
      }

      //
      // move further
      //
      this.shiftAgent(agent, map, thingMap, map3d);
    }
  }

  updateScoresView() {
    let el = document.querySelector('.scores strong');
    let currentValue = parseInt(el.textContent, 10) || 0;
    let newValue = this.scores;

    if (this.updateScoresInterval) {
      window.clearInterval(this.updateScoresInterval);
    }

    this.updateScoresInterval = window.setInterval(() => {
      currentValue += (newValue - currentValue) / 10;

      if (newValue - currentValue <= 1) {
        currentValue = newValue;
        window.clearInterval(this.updateScoresInterval);
        this.updateScoresInterval = 0;
      }

      el.textContent = currentValue.toFixed(0);
    }, 32);
  }

  gameOver(isCollision: boolean, isOutOfBounds: boolean) {
    let isSuccess = !isCollision && !isOutOfBounds;
    let killTheGame = () => {
      this.pause();
      this.gameOverCallback(this.scores, isSuccess);
    };

    if (isOutOfBounds || isSuccess) {
      killTheGame();

    } else {
      window.setTimeout(killTheGame, 25);
    }
  }

  destroy() {
    throw 'TBD';
  }

}

export = GamePlay;
