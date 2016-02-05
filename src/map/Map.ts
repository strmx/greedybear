
class MapObjectView {
  public material: any;
  public geometry: any;
}

class MapObject {
  private static _idCounter = 0;
  public id: number;
  public type: string;
  public view: MapObjectView;

  constructor(type: string) {
    this.id = MapObject._idCounter++;
    this.type = type;
  }
}

class Map {
  public pattern: number[][];
  public width: number;
  public heigh: number;
  public objects: MapObject[] = [];

  // constructor(pattern: MapPattern) {
  //
  // }
}
