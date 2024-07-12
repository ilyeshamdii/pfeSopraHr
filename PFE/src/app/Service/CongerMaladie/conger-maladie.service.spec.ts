import { TestBed } from '@angular/core/testing';

import { CongerMaladieService } from './conger-maladie.service';

describe('CongerMaladieService', () => {
  let service: CongerMaladieService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CongerMaladieService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
