import { TestBed } from '@angular/core/testing';

import { DonnerServiceService } from './donner-service.service';

describe('DonnerServiceService', () => {
  let service: DonnerServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DonnerServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
