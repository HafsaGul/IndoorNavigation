export interface NodeXYZ {
  x: number;
  y: number;
  z: number;
}

export interface TagXY {
  x: number;
  y: number;
}

export class GraphNode {
  private _position: NodeXYZ;
  private _f: number;
  private _g: number;
  private _h: number;
  private _edgeCost: number;
  private _parent: GraphNode;
  private _visited: boolean;
  private _closed: boolean;
  private _edges: number[];
  private _id: number;
  private _isStairs: boolean;
  //
  constructor(x: number, y: number, z: number) {
    this._position = { x: x, y: y, z: z };
    this._f = 0;
    this._g = 0;
    this._h = 0;
    this._edgeCost = 0;
    this._parent = null;
    this._visited = false;
    this._closed = false;
    this._edges = [];
    this._id = null;
    this._isStairs = false;
  }
  //
  reset(): void {
    this._f = 0;
    this._g = 0;
    this._h = 0;
    this._edgeCost = 0;
    this._parent = null;
    this._visited = false;
    this._closed = false;
    this._id = null;
    this._isStairs = false;
  }
  //
  // setting up edge b/w nodes
  setEdge(node: number): void {
    this._edges.push(node);
  }
  //
  get neighbors(): number[] { return this._edges; }
  //
  get isStairs() { return this._isStairs; }
  get id() { return this._id; }
  get position() { return this._position; }
  get f() { return this._f; }
  get g() { return this._g; }
  get h() { return this._h; }
  get edgeCost() { return this._edgeCost; }
  get parent() { return this._parent; }
  get visited() { return this._visited; }
  get closed() { return this._closed; }
  //
  set isStairs(b: boolean) { this._isStairs = b; }
  set id(id: number) { this._id = id; }
  set position(obj: { x: number, y: number, z: number }) {
    this._position.x = obj.x;
    this._position.y = obj.y;
    this._position.z = obj.z;
  }
  set f(f: number) { this._f = f; }
  set g(g: number) { this._g = g; }
  set h(h: number) { this._h = h; }
  set edgeCost(cost: number) { this._edgeCost = cost; }
  set parent(p: GraphNode) { this._parent = p; }
  set visited(v: boolean) { this._visited = v; }
  set closed(c: boolean) { this._closed = c; }

}