import { BuildingMapService, StairsElevatorNode, XYZ } from './building-map.service';
import { GraphNode } from './GraphNode';
import { BeaconData } from './beacon-monitoring-regioning.service';


export class PathGraph {
  private _graph: Map<number, GraphNode>;
  //for each floor number of stairs Map
  private _floorStairs: Map<number, number[]>;
  //stairs connections
  //right now simple model: one stairs node is connected to antoher stairs node on another floor
  private _stairsConnections: Map<number, number>;
  //nodes per floor
  private readonly _nodesPerFloor: number;
  //
  //
  get totalNodes(): number { return this._graph.size; }
  //
  constructor(private _buildingMapService: BuildingMapService) {
    this._graph = new Map();
    this._floorStairs = new Map();//stairs per floor
    this._stairsConnections = new Map();
    this._nodesPerFloor = this._buildingMapService.pathMapLength();
    this.constructGraph();
    this.constructStairsConnections();
    // console.log('Graph: ', this._graph);
    // console.log('Floor Stairs: ', this._floorStairs);
    // console.log('Stairs Connections: ', this._stairsConnections);

  }
  /* Find the start node
     Depending on Device location and beacons data find the start node
  */
  findStartNode(bd: BeaconData[], deviceLocation: XYZ): GraphNode {
    //use closest beacon to determine which floor we are on
    bd.sort((a, b) => a.accuracy - b.accuracy); //beacons with smallest distance come first
    let floorId = bd[0].major;
    //search on specific floor
    let searchStartAt = floorId * this._nodesPerFloor;
    let searchEndAt = floorId * this._nodesPerFloor + (this._nodesPerFloor - 1);

    //create GraphNode for deviceLocation
    let gn: GraphNode = new GraphNode(deviceLocation.x, deviceLocation.y, deviceLocation.z); //z is not used

    let smallestDis = this.cost(this.getGraphNode(searchStartAt), gn);
    let smallestDisNodeID: number = searchStartAt;
    //brute force search 
    for (let n = searchStartAt + 1; n <= searchEndAt; n++) {
      if (this.cost(this.getGraphNode(n), gn) < smallestDis) {
        smallestDis = this.cost(this.getGraphNode(n), gn);
        smallestDisNodeID = n;
      }
    }
    return this.getGraphNode(smallestDisNodeID);
  }

  get nodesPerFloor(): number {
    return this._nodesPerFloor;
  }
  //
  constructStairsConnections(): void {
    let stairsElevators: StairsElevatorNode[] = this._buildingMapService.pathMapStairsElevatorsConnections();
    for (let se of stairsElevators) {
      let id = se.node.major * this._nodesPerFloor + se.node.minor;
      let connection = se.connections.major * this._nodesPerFloor + se.connections.minor;
      this._stairsConnections.set(id, connection);
    }

  }
  //
  stairsConnections(node: number): number { return this._stairsConnections.get(node); }
  //
  getGraphNode(id: number): GraphNode { return this._graph.get(id); }
  //
  private constructGraph(): void {
    let LEN = this._nodesPerFloor;
    let floors = this._buildingMapService.pathMapFloors();
    for (let floor of floors) {
      let nodes = floor.nodes;
      let stairs: number[] = [];
      let floorId: number = floor.major;
      for (let node of nodes) {
        let id = node.major * LEN + node.minor;
        let graphNode = new GraphNode(node.x, node.y, node.z);
        graphNode.id = id;
        if (node.stairs) {
          stairs.push(id);
          graphNode.isStairs = true;
        }
        let connections = node.connections;
        for (let con of connections) {
          graphNode.setEdge(con.major * LEN + con.minor);
        }
        this._graph.set(id, graphNode);
        //floorId = node.major;
      }
      this._floorStairs.set(floorId, stairs);
    }
  }
  //floorId is the major number defined in data.json
  //number of stairs/ elevators on each floor
  floorStairs(floorId: number): number[] {
    return this._floorStairs.get(floorId);
  }
  //
  public neighbors(nodeid: number): GraphNode[] {
    let node = this._graph.get(nodeid);
    if (node) {
      const neighborsIds = node.neighbors;
      let neighbors: GraphNode[] = [];
      for (let id of neighborsIds) {
        if (this._graph.get(id)) neighbors.push(this._graph.get(id));
      }

      return neighbors;
    }
    return null;
  }
  //
  public cost(n1: GraphNode, n2: GraphNode): number {

    let x1 = n1.position.x;
    let y1 = n1.position.y;
    // let z1 = n1.position.z;

    let x2 = n2.position.x;
    let y2 = n2.position.y;
    //let z2 = n2.position.z;

    let xdif = Math.abs(x2 - x1);
    let ydif = Math.abs(y2 - y1);
    //let zdif = Math.abs ( z2 - z1 );
    return Math.sqrt(Math.pow(xdif, 2) +
      Math.pow(ydif, 2)
    );

  }
  //
  public Cost(n1: number, n2: number): number {
    let node1 = this._graph.get(n1);
    let node2 = this._graph.get(n2);
    if (node1 && node2) {
      return this.cost(node1, node2);
    }
    return null;
  }
}