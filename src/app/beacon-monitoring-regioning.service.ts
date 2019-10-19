import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import {Subject} from 'rxjs';


import {BuildingMapService, BeaconRegion} from './building-map.service';
//shape of data coming from beacon
export interface BeaconData{
  uuid:string;
  major:number;
  minor:number;
  proximity:string;
  rssi:number;
  tx:number;
  accuracy:number;//distance
}

@Injectable({
  providedIn: 'root'
})
export class BeaconMonitoringRegioningService {
  private readonly regions: BeaconRegion[];
  private delegate = new iBeaconplugins.locationManager.Delegate();
  private _beaconsData: Subject<BeaconData[]>;
  get beaconsData():Subject<BeaconData[]> {return this._beaconsData;}
  //constructor
  constructor(private platform: Platform,
    private buildingMapService: BuildingMapService) { 
      console.log("BeaconMonitoringRegioningService");
      this.regions = buildingMapService.regions;
      this._beaconsData = new Subject<BeaconData[]> ();
      this. initializeDelegate();
  }
  //callbacks
  initializeDelegate():void {
    /*
    Both didDetermineStateForRegion() and didStartMonitoringForRegion() relate to region 
    monitoring. didDetermineStateForRegion() called for each region when we issue 
    startMonitoringForRegion(). Later, didDetermineStateForRegion() called for each monitored
    region whenever we enter into or exit from monitored regions.
    -
    didStartMonitoringForRegion() called once for each region when we issue 
    startMonitoringForRegion(). 
    - didRangeBeaconsInRegion() called periodically for each region if we 
    issue startRangingBeaconsInRegion(temp).

    */ 
    let _this = this;
    this.delegate.didDetermineStateForRegion = function (pluginResult:
      {eventType:string,region:{identifier:string,uuid:string,typeName:string}, state:string}) {

      //console && console.log('Enter/ Exit from a aregion: ' , pluginResult);
  };
  //
  this.delegate.didStartMonitoringForRegion = function (pluginResult:
    {eventType:string,region:{identifier:string,uuid:string,typeName:string}, state:string}) {
      //console && console.log('Beacon Scanning started for a region: ' , pluginResult);
  };
  /* For android:
          Public Methods
          public abstract void didRangeBeaconsInRegion (Collection<Beacon> beacons, Region region)
            Called once per second to give an estimate of the mDistance to visible beacons

          Parameters
          beacons	a collection of Beacon objects that have been seen in the past second
          region	the Region object that defines the criteria for the ranged beacons

  */

  this.delegate.didRangeBeaconsInRegion = function (pluginResult:
    {eventType:string,region:{identifier:string,uuid:string,typeName:string},
    beacons: BeaconData[]}) {
    //console && console.log('Scanned Beacons in a region: ',pluginResult);
    if (pluginResult.beacons.length > 0) {
      _this._beaconsData.next (pluginResult.beacons) ;
    }
  }
  //
  iBeaconplugins.locationManager.setDelegate(this.delegate);
  }//
  start(): void{
    var _this = this;
    this.platform.ready().then((readySource) => { //readySource is dom or cordova
      console.log('Platform ready from', readySource);
      if ( this.platform.is('cordova') ) { //native commands only for cordova
        iBeaconplugins.locationManager.isBluetoothEnabled()
         .then(function(isEnabled:boolean){
              console.log("isEnabled: " + isEnabled);
              if (isEnabled) {
                return 'OK';
              } else {
                return iBeaconplugins.locationManager.enableBluetooth();
              }
          })
          .then(function(ok:string){ // when disableBluetooth() / enableBluetooth() resolved then return OK
            console.log("enable/disable: " + ok); //ok = OK
            for (let region of _this.regions){
              let temp = new iBeaconplugins.locationManager.BeaconRegion(region.identifier,region.uuid,region.major);
              iBeaconplugins.locationManager.startMonitoringForRegion(temp)
              .fail(function(e) { console.error(e); })
              .done();
              iBeaconplugins.locationManager.startRangingBeaconsInRegion(temp)
              .fail(function(e) { console.error(e); })
              .done();
            }//for
          })
          .fail(function(e) { console.error(e); }) // error for disableBluetooth() / enableBluetooth
          .done();

      } //is('cordova')
    });//platform.ready()
  }
  //
  stop(): void{
    for (let region of this.regions){
      let temp = new iBeaconplugins.locationManager.BeaconRegion(region.identifier,region.uuid,region.major);
      iBeaconplugins.locationManager.stopMonitoringForRegion(temp)
	    .fail(function(e) { console.error(e); })
	    .done();
      iBeaconplugins.locationManager.stopRangingBeaconsInRegion(temp)
	    .fail(function(e) { console.error(e); })
      .done();
    }//for
  }
}
