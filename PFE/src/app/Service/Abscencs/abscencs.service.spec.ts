import { TestBed } from '@angular/core/testing';

import { AbscencsService } from './abscencs.service';

describe('AbscencsService', () => {
  let service: AbscencsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AbscencsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
