import { TestBed } from '@angular/core/testing';

import { AstarService } from './astar';

describe('AstarService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AstarService = TestBed.get(AstarService);
    expect(service).toBeTruthy();
  });
});
