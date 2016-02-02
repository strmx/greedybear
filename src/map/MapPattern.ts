import PatternHelper = require('./PatternHelper');

enum CELL_TYPE {
  WALL = 1,
  ROAD = 0,
};

class MapPattern {
  public pattern: number[][];
}

export = MapPattern;
