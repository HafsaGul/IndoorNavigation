import { Injectable } from '@angular/core';

/**
  Declare the shape of BeaconRegion used by corodova plugin: com.unarin.cordova.beacon  
*/
export interface BeaconRegion {
  identifier: string;
  uuid: string;
  major?: number;
  minor?: number;
  new?(identifier: string, uuid: string, major?: number, minor?: number, notifyEntryStateOnDisplay?: any);
}

/**

Declare the shape of each Beacon defined in the data.json. 

*/
/**
 *  Shape of connection to other beacons
 */
export interface Connection {
  major: number;
  minor: number;
}
/**
 * 
 * 
 */
export interface XYZ {
  x: number;
  y: number;
  z: number;
}
//
//
export interface Beacon {
  major: number;
  minor: number;
  x: number;
  y: number;
  z: number;
  // walkable: boolean;
  // tags: string[];
  // connection: Connection[];
}
/**

Declare the shape of each BeaconRegion defined in the data.json. BeaconRegion of cordova plugin is created using 
this BeaconRegionJSON

*/

export interface BeaconRegionJSON {
  identifier: string;
  major: number | null;
  minor: number | null;
  beacons: Beacon[];
}
//
export interface PathMapNode {
  major: number;
  minor: number;
  x: number;
  y: number;
  z: number;
  tx: number;
  ty: number;
  tags: string[];
  connections: Connection[];
  stairs?: boolean;
}
//
export interface PathMapRegion {
  identifier: string;
  major: number;
  minor: number;
  nodes: PathMapNode[];
}
//
export interface StairsElevatorNode {
  node: Connection;
  connections: Connection;
}
//
export interface PathMap {
  //number of nodes on each floor ( Constant ). In reality some floors may have less nodes.
  //it makes node id cal easy.
  length: number;
  regions: PathMapRegion[];
  stairsElevators: StairsElevatorNode[];
}

/**

Declare the shape of json data in data.json

*/

export interface BuildingMap {
  uuid: string;
  distance_unit: string;
  regions: BeaconRegionJSON[];
  map: PathMap;
}
//

export interface TagNodeMapping {
  [index: string]: { major: number, minor: number };
}

@Injectable({
  providedIn: 'root'
})
export class BuildingMapService {
  private readonly _uuid: string; //uuid for building
  private readonly _distance_unit: string; //unit of distance b/w beacons
  private readonly _regions: BeaconRegionJSON[]; //all regions in a building; each floor is a separate region. 
  private _beaconregions: BeaconRegion[]; //all regions in a building; each floor is a separate region. 
  private readonly _buildingMap: BuildingMap; //whole data.json object
  private _tagsToNodeMapping: TagNodeMapping;
  public tagsCount: number = 0;
  private readonly _map: PathMap;

  constructor() {
    this._buildingMap = require('../assets/data.json');
    this._uuid = this._buildingMap.uuid;
    this._distance_unit = this._buildingMap.distance_unit;
    this._regions = this._buildingMap.regions;
    this._map = this.buildingMap.map;
    this._beaconregions = null;
    this._tagsToNodeMapping = null;

    console.log('BuildingMapService::Constructor');

  }
  //
  pathMapLength(): number { return this._map.length; }
  //
  pathMapFloors(): PathMapRegion[] { return this._map.regions; }
  //
  pathMapStairsElevatorsConnections(): StairsElevatorNode[] { return this._map.stairsElevators; }

  //
  getMap() {
    return this._map;
  }

  get uuid(): string { return this._uuid; }
  get distance_unit(): string { return this._distance_unit; }
  get buildingMap(): BuildingMap { return this._buildingMap; }
  get regions(): BeaconRegion[] {
    if (this._beaconregions === null) { //compute just once
      console.log("Calling 1s Time: regions");
      this._beaconregions = [];
      for (let region of this._regions) {
        let r: BeaconRegion = {
          identifier: region.identifier,
          major: region.major,
          minor: region.minor,
          uuid: this.uuid
        };
        this._beaconregions.push(r);
      }
      return this._beaconregions;
    }//null
    return this._beaconregions;
  }
  /*
     Tag must unqiue. Duplicate tags overwrite previous node mapping.

  * */
  get tagsToNodeMapping(): TagNodeMapping {
    if (this._tagsToNodeMapping === null) {
      console.log("Calling 1s Time: tagsToNodeMapping");
      this._tagsToNodeMapping = {};
      let regionMajor: number;
      // let regionBeacons: Beacon[];
      // let beaconTags:string[];
      let regionNodes: PathMapNode[];
      let nodeTags: string[];


      for (let region of this._map.regions) {
        regionMajor = region.major;
        regionNodes = this.getNodes(regionMajor);
        nodeTags = []; //safe but not required??
        for (const b of regionNodes) {
          nodeTags = b.tags;
          for (const t of nodeTags) {
            this._tagsToNodeMapping[t] = { major: b.major, minor: b.minor };
            this.tagsCount++;
          }
        }
      }
      if (this.tagsCount !== Object.keys(this._tagsToNodeMapping).length) { console.log('Warning: Duplicate Tag Found!'); }
      return this._tagsToNodeMapping;
    }//null
    return this._tagsToNodeMapping;
  }
  // return all tags of a building
  getTags(): string[] {
    return Object.keys(this.tagsToNodeMapping);
  }
  //Each region specified in the data.json has unique major number
  //Each region has number of beacons
  getBeacons(major: number): Beacon[] {
    for (let region of this._regions) {
      if (major == region.major) {
        return region.beacons;
      }
    }
    return null;

  }
  // just return the nodes field of PathMapRegion
  getNodes(major: number): PathMapNode[] {
    for (const region of this._map.regions) {
      if (major == region.major) {
        return region.nodes;
      }

    }
    return null;

  }
  //
  getBeaconXYZ(major: number, minor: number): XYZ | null {
    if (this.getBeacons(major)) {
      for (let b of this.getBeacons(major)) {
        if (b.major == major && b.minor == minor) {
          //console.log(typeof b.major , typeof major );
          return { x: b.x, y: b.y, z: b.z };
        }
      }
    }
    return null;
  }//
  getNodeXYZ(major: number, minor: number): XYZ {
    if (this.getNodes(major)) {
      for (let b of this.getNodes(major)) {
        if (b.major == major && b.minor == minor) {
          return { x: b.x, y: b.y, z: b.z };
        }
      }
    }
    return null;
  }
  //
  getNodeTags(major: number, minor: number): string[] {
    if (this.getNodes(major)) {
      for (let b of this.getNodes(major)) {
        if (b.major == major && b.minor == minor) {
          return b.tags;
        }
      }
    }
    return null;
  }
  //
  // getBeaconTags(major:number,minor:number): string[] | null {
  //   if (this.getBeacons(major)){ 
  //   for (let b of this.getBeacons(major)){
  //     if ( b && b.major === major && b.minor === minor) {
  //        return b.tags;
  //     }
  //   }
  // }
  //   return null;
  // }
  // //
  // getBeaconConnections(major:number,minor:number): Connection[] | null {
  //   if (this.getBeacons(major)){
  //   for (let b of this.getBeacons(major)){
  //     if ( b && b.major === major && b.minor === minor) {
  //        return b.connection;
  //     }
  //   }
  // }
  //   return null;
  // }
  // //
  // isBeaconWalkable(major:number,minor:number): boolean|null {
  //   if (this.getBeacons(major)){
  //   for (let b of this.getBeacons(major)){
  //     if ( b && b.major === major && b.minor === minor) {
  //        return b.walkable;
  //     }
  //   }
  //   }
  //   return null;
  // }

}//class
