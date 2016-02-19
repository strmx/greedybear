/// <reference path="../typings/interfaces.d.ts"/>

import GamePlay = require('./game/GamePlay');
import Renderer = require('./render/Renderer');

let renderer = new Renderer();
let gameplay = new GamePlay(renderer);
