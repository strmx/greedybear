
class Elevation {
  x: number
  y: number
  height: number
  neighbors: Elevation[] = [];

  constructor(height: number, x: number, y: number) {
    this.x = x;
    this.y = y;
    this.height = height;
  }

  // top, right, bottom, left
  updateNeighbors(elevationMap: Elevation[][]) {
    let leftCol = elevationMap[this.x - 1] || [];
    let rightCol = elevationMap[this.x + 1] || [];
    this.neighbors.push(elevationMap[this.x][this.y - 1] || null);
    this.neighbors.push(rightCol[this.y] || null);
    this.neighbors.push(elevationMap[this.x][this.y + 1] || null);
    this.neighbors.push(leftCol[this.y] || null);
  }

}

export = Elevation;
