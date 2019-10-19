import { Component } from '@angular/core';
import { BuildingMapService } from '../building-map.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  secondFloor: any;
  mapData: any;
  destTags2: any;

  constructor(  private buildingMapService: BuildingMapService, ) {}

  ngOnInit() {
     this.destTags2 = this.buildingMapService.getTags();
   
    this.mapData = this.buildingMapService.getMap();
    this.secondFloor = this.mapData.regions[1].nodes
    /* console.log("service",this.mapData.length);
    console.log("service1",this.mapData.regions.length);
    console.log("service2",this.mapData.regions[0].nodes.length); */
    console.log("service3", this.secondFloor);

  }


}
