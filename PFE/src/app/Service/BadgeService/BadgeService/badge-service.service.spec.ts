import { TestBed } from '@angular/core/testing';

import { BadgeServiceService } from './badge-service.service';

describe('BadgeServiceService', () => {
  let service: BadgeServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BadgeServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
