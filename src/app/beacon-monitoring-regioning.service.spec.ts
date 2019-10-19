import { TestBed } from '@angular/core/testing';

import { BeaconMonitoringRegioningService } from './beacon-monitoring-regioning.service';

describe('BeaconMonitoringRegioningService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BeaconMonitoringRegioningService = TestBed.get(BeaconMonitoringRegioningService);
    expect(service).toBeTruthy();
  });
});
