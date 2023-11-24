import { TestBed } from '@angular/core/testing';

import { CircledataService } from './circledata.service';

describe('CircledataService', () => {
  let service: CircledataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CircledataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
