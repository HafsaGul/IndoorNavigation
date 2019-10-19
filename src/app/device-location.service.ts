import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { BuildingMapService } from './building-map.service';
import { BeaconMonitoringRegioningService, BeaconData } from './beacon-monitoring-regioning.service';
import { XYZ } from './building-map.service';
import { Trilateration } from './trilateration';
import { type } from 'os';


@Injectable({
  providedIn: 'root'
})
export class DeviceLocationService {

  private trilateration: Trilateration;
  private _deviceLocation: Subject<XYZ>;

  constructor(private buildingMapService: BuildingMapService,
    private beaconMonitoringRegioningService: BeaconMonitoringRegioningService) {
    this.trilateration = new Trilateration();
    this._deviceLocation = new Subject<XYZ>();
    this.beaconMonitoringRegioningService.beaconsData.subscribe(
      {
        next: (bd: BeaconData[]) => this.findDevLocation(bd)
      }
    );
  }
  //
  get deviceLocation(): Subject<XYZ> { return this._deviceLocation; }
  //
  findDevLocation(bd: BeaconData[]) {
    //beacons with close distances lie on the same floor
    bd.sort((a, b) => a.accuracy - b.accuracy);
    //now get XYZ of beacons
    let positions: XYZ[] = [];
    let distances: number[] = [];
    //console.log(bd);
    for (let b of bd) {
      let p = this.buildingMapService.getBeaconXYZ(b.major, b.minor);// b.major and b.minor are string
      //console.log(p);
      if (p) {
        positions.push(p);
        distances.push(b.accuracy);
        //console.log( 'b.major,b.minor, b.accuracy', b.major,b.minor, b.accuracy);
      }
    }//for let b
    let deviceLocation: XYZ = null;
    // console.log(positions);
    if (bd.length >= 3) {
      deviceLocation = this.trilateration.findDevLocation(positions, distances);// 2D trilateration
      this._deviceLocation.next(deviceLocation);
      console.log("deviceLocation", deviceLocation);
      return;
    } else {
      this._deviceLocation.next(positions[0]); //from json file
      console.log("positions[0]", positions[0]);
      return;
    }
  }
}
