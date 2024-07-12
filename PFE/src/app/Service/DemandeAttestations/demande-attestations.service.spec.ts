import { TestBed } from '@angular/core/testing';

import { DemandeAttestationsService } from './demande-attestations.service';

describe('DemandeAttestationsService', () => {
  let service: DemandeAttestationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DemandeAttestationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
