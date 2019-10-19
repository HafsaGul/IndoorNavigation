import { Component } from '@angular/core';
import { IonicSelectableComponent } from 'ionic-selectable';
import { BuildingMapService } from '../building-map.service';
import { GraphNode } from '../GraphNode';
import { Astar } from '../astar';
import { PathGraph } from '../PathGraph';
import { DeviceLocationService } from '../device-location.service';
import { XYZ } from '../building-map.service';
import { BeaconMonitoringRegioningService, BeaconData } from '../beacon-monitoring-regioning.service';

class Destination {
  public id: number;
  public name: string;
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  private devPosition: XYZ = null;
  public beaconData: BeaconData[] = null;
  destinations: Destination[] = [];
  private mapData: any;
  public beacons: any;
  public tri_data: any;
  //public path: any;
  //public path2: any;

  public floor1path: any[] = [];
  public floor2path: any[] = [];
  public secondFloor: any;
  public destTagX: number;
  public destTagY: number;
  public destTag2X: number;
  public destTag2Y: number;
  public startTagX: number;
  public startTagY: number;
  public startTag2X: number;
  public startTag2Y: number;

  frstfloor: any;
  constructor(
    private buildingMapService: BuildingMapService,
    private deviceLocationService: DeviceLocationService,
    private beaconMonitoringRegioningService: BeaconMonitoringRegioningService

  ) { }

  portChange(event: {
    component: IonicSelectableComponent,
    value: any
  }) {
    console.log('port:', event.value);
    console.log('port-1:', event.value.name);

    this.mapData = this.buildingMapService.getMap();
    for (let m = 0; m < this.mapData.regions.length; m++) {
      for (let n = 0; n < this.mapData.regions[m].nodes.length; n++) {
        if (this.mapData.regions[m].nodes[n].tags == event.value.name) {

          let major = this.mapData.regions[m].nodes[n].major;
          let minor = this.mapData.regions[m].nodes[n].minor;

          this.destTagX = this.mapData.regions[m].nodes[n].tx;
          this.destTagY = this.mapData.regions[m].nodes[n].ty;


          console.log("Major", major);
          console.log("Minor", minor);
          console.log("destTagX", this.destTagX);
          console.log("destTagY", this.destTagY);

          let pg = new PathGraph(this.buildingMapService);
          let astar = new Astar(pg);
          astar.shortestPath.subscribe({
            next: (path: GraphNode[]) => {
              console.log("Path of path", path);
              let stairsIndex = -1;
              path.forEach((item, index) => {
                if (item.isStairs == true) {
                  stairsIndex = index;
                  return;

                }
              });
              console.log("stairsIndex", stairsIndex);

              this.floor1path = [];
              this.floor2path = [];
              if (stairsIndex != -1) {
                this.floor1path = path.slice(0, stairsIndex);
                this.floor2path = path.slice(stairsIndex);

                console.log("floor1path", this.floor1path);
                console.log("floor2path", this.floor2path);

              }
              else {
                this.floor1path = path;
                //this.floor2path = [];
              }
            }
          });

          let id_cal = major * this.mapData.length + minor;
          console.log("calculated id=", id_cal);
          if (this.floor2path.length > 0) {
            this.destTagX = 40;
            this.destTagY = 245;
            this.destTag2X = this.mapData.regions[m].nodes[n].tx;
            this.destTag2Y = this.mapData.regions[m].nodes[n].ty;
          }

          astar.findPath(pg.getGraphNode(14), pg.getGraphNode(id_cal));
          this.startTagX = this.mapData.regions[0].nodes[14].tx;
          this.startTagY = this.mapData.regions[0].nodes[14].ty;
          this.startTag2X = this.mapData.regions[1].nodes[0].tx;
          this.startTag2Y = this.mapData.regions[1].nodes[0].ty;

          console.log("startTagX", this.startTagX);
          console.log("startTagY", this.startTagY);
          console.log("startTag2X", this.startTag2X);
          console.log("startTag2Y", this.startTag2Y);
        }
      }
    }
  } 

  ngOnInit() {
    let destTags = this.buildingMapService.getTags();
    destTags.forEach((item, index) => {
      this.destinations.push({ id: index + 1, name: item });
    });
    console.log('this.destinations', this.destinations);
    this.mapData = this.buildingMapService.getMap();
    this.frstfloor = this.mapData.regions[0].nodes
    this.secondFloor = this.mapData.regions[1].nodes

    /* console.log("service",this.mapData.length);*/
    console.log("region0", this.mapData.regions[1].nodes.length);
    console.log("region1", this.mapData.regions[0].nodes.length);
    console.log("service3", this.frstfloor);
    this.beacons = this.buildingMapService.getBeacons(0);

  
   this.beaconMonitoringRegioningService.beaconsData.subscribe(
      { next: (bd: BeaconData[]) => this.beaconData = bd });

    this.deviceLocationService.deviceLocation.subscribe(
      {
        next: (devPosition: XYZ) => {
        this.devPosition = devPosition
          console.log("devPosition", this.devPosition);
        }
      }
    ); 
 
    //console.log("devPosition",this.devPosition);

    //return device position: updated each time we receive beacon data
  }
}
