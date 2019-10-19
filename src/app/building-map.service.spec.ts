import { TestBed } from '@angular/core/testing';

import { BuildingMapService } from './building-map.service';

describe('BuildingMapService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BuildingMapService = TestBed.get(BuildingMapService);
    expect(service).toBeTruthy();
  });
});
