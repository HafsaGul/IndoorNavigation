import { Subject } from 'rxjs';
import { BinaryHeap } from './BinaryHeap';
import { PathGraph } from './PathGraph';
import { GraphNode } from './GraphNode';

export class Astar {
  private _openHeap: BinaryHeap;
  private _pathGraph: PathGraph;
  private _shortestPath: Subject<GraphNode[]>;

  get shortestPath(): Subject<GraphNode[]> { return this._shortestPath; }


  constructor(pg: PathGraph) {
    this._openHeap = new BinaryHeap(function (node: GraphNode) {
      return node.f;
    });
    this._pathGraph = pg;
    this._shortestPath = new Subject<GraphNode[]>();
    console.log('astar.service.ts');
  }
  // call it only when node and goal are on the same floor
  private heuristic(node: GraphNode, gaol: GraphNode): number {
    return this._pathGraph.cost(node, gaol);
  }
  //
  findPath(start: GraphNode, goal: GraphNode) {
    console.assert(start instanceof GraphNode && goal instanceof GraphNode, 'start and goal are of type GraphNode');
    console.log(typeof start, typeof goal);
    const startId = start.id;
    const goalId = goal.id;

    const nodesPerFloor = this._pathGraph.nodesPerFloor;
    const startFloor = Math.floor(startId / nodesPerFloor);
    const goalFloor = Math.floor(goalId / nodesPerFloor);
    console.log('Before if( startFloor === goalFloor )');
    //start and goal on the same floor
    if (startFloor === goalFloor) {
      this._shortestPath.next(this.findPathSameFloor(start, goal));
      return;
    }
    // start and goal are on separate floors

    //which stairs on start floor is closest to start node based on the distance?
    let stairsOnStartNode = this._pathGraph.floorStairs(startFloor);//array
    let closestStairsId = stairsOnStartNode[0];
    let dis = this._pathGraph.Cost(startId, stairsOnStartNode[0]);
    for (let stairsId = 1; stairsId < stairsOnStartNode.length; stairsId++) {

      if (this._pathGraph.Cost(startId, stairsOnStartNode[stairsId]) < dis) {
        closestStairsId = stairsOnStartNode[stairsId];
      }
    }
    console.log(startFloor, ' ', closestStairsId);
    console.assert(startFloor === Math.floor(closestStairsId / nodesPerFloor),
      "Start Floor id must equal to closest stairs floor id");
    //calculate path b/w start node and closest stairs node
    let path: GraphNode[] = this.findPathSameFloor(start, this._pathGraph.getGraphNode(closestStairsId));
    //now find connected stairs on another floor
    let nextStairsNodeId: number;
    if (this._pathGraph.stairsConnections(closestStairsId)) {
      nextStairsNodeId = this._pathGraph.stairsConnections(closestStairsId); //just next stairs node
      //path.push (this._pathGraph.getGraphNode(nextStairsNodeId));
    } else {
      this._shortestPath.error('PathGraph. stairsConnections failed 01'); //incomplete path
      return;
    }
    //now keep moving stairs node to another stairs node until we reach to goalFloor
    console.log(' Before while (goalFloor !== Math.floor (nextStairsNodeId / nodesPerFloor))');
    while (goalFloor !== Math.floor(nextStairsNodeId / nodesPerFloor)) {
      if (this._pathGraph.stairsConnections(nextStairsNodeId)) {
        path.push(this._pathGraph.getGraphNode(nextStairsNodeId));
        nextStairsNodeId = this._pathGraph.stairsConnections(nextStairsNodeId);
      }

    }

    //
    if (nextStairsNodeId) {
      console.assert(goalFloor === Math.floor(nextStairsNodeId / nodesPerFloor),
        "Goal Floor id must equal to stairs floor id");

      // Find path from stairs to goal node
      let nextPath = this.findPathSameFloor(this._pathGraph.getGraphNode(nextStairsNodeId), goal);
      console.log(' Before for(let gn of nextPath )');
      for (let gn of nextPath) {
        path.push(gn);
      }
      this._shortestPath.next(path);

    } else {
      this._shortestPath.error('PathGraph. stairsConnections failed 02'); //incomplete path
    }
  }
  //
  private findPathSameFloor(start: GraphNode, end: GraphNode): GraphNode[] {
    this._openHeap.reset();
    this._openHeap.push(start);
    console.log('findPathSameFloor: before while(this._openHeap.size() > 0) ');
    while (this._openHeap.size() > 0) {

      // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
      const currentNode = this._openHeap.pop();

      // End case -- result has been found, return the traced path.
      if (currentNode === end) {
        let curr = currentNode;
        let ret: GraphNode[] = [];
        while (curr.parent) {
          ret.push(curr);
          curr = curr.parent;
        }
        //add start node
        ret.push(curr);
        return ret.reverse();
      }

      // Normal case -- move currentNode from open to closed, process each of its neighbors.
      currentNode.closed = true;

      // Find all neighbors for the current node. Optionally find diagonal neighbors as well (false by default).
      const neighbors = this._pathGraph.neighbors(currentNode.id);
      if (neighbors) {
        for (const neighbor of neighbors) {

          if (neighbor.closed) {
            // Not a valid node to process, skip to next neighbor.
            continue;
          }

          // The g score is the shortest distance from start to current node.
          // We need to check if the path we have arriveNd at this neighbor is the shortest one we have seen yet.
          //neighbor.cost is the cost b/w currentNode and neighbor
          let gScore = currentNode.g + this._pathGraph.cost(currentNode, neighbor);
          let beenVisited = neighbor.visited;

          if (!beenVisited || gScore < neighbor.g) {
            console.log('neighbor ', neighbor.id, ' g: ', gScore, ' current ', currentNode.id, ' g: ', currentNode.g);

            // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
            neighbor.visited = true;
            neighbor.parent = currentNode;
            neighbor.h = this.heuristic(neighbor, end);
            neighbor.g = gScore;
            neighbor.f = neighbor.g + neighbor.h;

            if (!beenVisited) {
              // Pushing to heap will put it in proper place based on the 'f' value.
              this._openHeap.push(neighbor);
            }
            else {
              // Already seen the node, but since it has been rescored we need to reorder it in the heap
              this._openHeap.rescoreElement(neighbor);
            }
          }
        }
      } // if(neighbors)
    }

    // No result was found - empty array signifies failure to find path.
    return null;
  }
}
