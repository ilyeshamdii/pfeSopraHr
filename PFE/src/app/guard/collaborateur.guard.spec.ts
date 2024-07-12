import { TestBed } from '@angular/core/testing';

import { CollaborateurGuard } from './collaborateur.guard';

describe('CollaborateurGuard', () => {
  let guard: CollaborateurGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(CollaborateurGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
