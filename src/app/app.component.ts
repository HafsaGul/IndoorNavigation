import { Component, OnInit, OnDestroy } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { BuildingMapService, BeaconRegion } from './building-map.service';
import { BeaconMonitoringRegioningService, BeaconData } from './beacon-monitoring-regioning.service';
import { DeviceLocationService } from './device-location.service';
import { PathGraph } from './PathGraph';
import { Astar } from './astar';
import { GraphNode } from './GraphNode';
import { XYZ } from './building-map.service';
import { Subject } from 'rxjs';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {
  private devPosition: XYZ = null;
  private beaconData: BeaconData[] = null;

  constructor(
    private buildingMapService: BuildingMapService,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private beaconMonitoringRegioningService: BeaconMonitoringRegioningService,
    //constructor of this class automatically cal dev position each time it receives beacons data
    private deviceLocationService: DeviceLocationService
    //private astarService: AstarService
  ) {
    console.log('app-root: app.component.ts');
  }
  /*  get getposition() : Subject<XYZ>{
    return this.deviceLocationService.deviceLocation;
  } */
  ngOnDestroy() {
    this.beaconMonitoringRegioningService.beaconsData.unsubscribe();
    this.beaconMonitoringRegioningService.stop();
  }
  ngOnInit() {
    console.log('app-root: app.component.ts::ngOnInit');

    this.platform.ready().then((readySource) => { //readySource is dom or cordova
      console.log('Platform ready from', readySource);
      if (this.platform.is("cordova")) {

        this.statusBar.styleDefault();
        this.splashScreen.hide();
        //start beacon scanning
        this.beaconMonitoringRegioningService.start();
        this.beaconMonitoringRegioningService.beaconsData.subscribe(
          { next: (bd: BeaconData[]) => this.beaconData = bd });

        //return device position: updated each time we receive beacon data
        this.deviceLocationService.deviceLocation.subscribe(
          { next: (devPosition: XYZ) => this.devPosition = devPosition }
        );

      }//if
    });


    //console.log('app-root: app.component.ts::ngOnInit');

    /* setTimeout( () => {
      let pg = new PathGraph(this.buildingMapService);
      let astar = new Astar(pg);
      astar.shortestPath.subscribe ({next:(path:GraphNode[]) => console.log(path)});
      let start: GraphNode;
      if (this.beaconData && this.devPosition){
           start = pg.findStartNode(this.beaconData, this.devPosition);
      }
     // console.log ("start.id", start.id);
      if(start && start.id < pg.totalNodes){
       console.log("Path ",astar.findPath(start, pg.getGraphNode(12)));
      } 
      
 
 //astar.findPath(pg.getGraphNode(1),pg.getGraphNode(6));
 
 
     }, 5000); */

    /*
    console.log ('Neighbors of node 0',pg.neighbors(0));
    console.log ('Neighbors of node 1',pg.neighbors(1));
    console.log ('Neighbors of node 6',pg.neighbors(6));
    console.log ('Neighbors of node 7',pg.neighbors(7));
    console.log ('Neighbors of node 8',pg.neighbors(8));
    console.log ('Neighbors of node 13',pg.neighbors(13));
    console.log ('Neighbors of node 14',pg.neighbors(14));
    console.log ('cost of node 0 and 6',pg.Cost(0,6));
    console.log ('cost of node 0 and 5',pg.Cost(0,5));
    console.log ('cost of node 0 and 4',pg.Cost(0,4));
    console.log ('cost of node 7 and 13',pg.Cost(7,13));
    console.log ('cost of node 7 and 12',pg.Cost(7,12));
    console.log ('cost of node 7 and 11',pg.Cost(7,11));
    */

    //  console.log ( 'buildingMap', this. buildingMapService.buildingMap );
    //  console.log ( 'Beacon regions' , this. buildingMapService.regions );
    //  console.log ( 'Beacons in Region 01: ',this. buildingMapService.getBeacons(1) );
    //  console.log ( 'PathFinding nodes in Region 01: ',this. buildingMapService.getNodes(1) );
    // console.log ( 'getBeaconXYZ(1,2)',this. buildingMapService.getBeaconXYZ(1,2) );
    // console.log ('getBeaconConnections(1,2)', this. buildingMapService.getBeaconConnections(1,2));
    // console.log ( 'isBeaconWalkable(1,2)', this. buildingMapService.isBeaconWalkable(1,2));
    // console.log ('getBeaconTags(1,2)', this. buildingMapService.getBeaconTags(1,2));
    //console.log ( 'Tags To Node Mapping' , this. buildingMapService.tagsToNodeMapping );
    // console.log ( 'tagsCount' , this. buildingMapService.tagsCount );
    //console.log('Landmark Tags ', this. buildingMapService.getTags());

    this.platform.ready().then((readySource) => { //readySource is dom or cordova
      console.log('Platform ready from', readySource);
      if (this.platform.is("cordova")) {

        this.statusBar.styleDefault();
        this.splashScreen.hide();

        this.beaconMonitoringRegioningService.start();

        this.beaconMonitoringRegioningService.beaconsData.subscribe({
          next: (beaconData: BeaconData[]) => { console.log('1st', beaconData); }
        });

        /*  setTimeout ( () => {
         this.beaconMonitoringRegioningService.beaconsData.subscribe( {next: (beaconData:BeaconData[]) =>
           { console.log('2nd', beaconData); }
           }); }, 2000);
           setTimeout ( () => {
             this.beaconMonitoringRegioningService.beaconsData.subscribe( {next: (beaconData:BeaconData[]) =>
               { console.log('3rd', beaconData); }
               }); }, 6000); */
      }
    });
  }
}
