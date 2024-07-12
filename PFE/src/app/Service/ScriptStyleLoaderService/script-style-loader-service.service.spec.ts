import { TestBed } from '@angular/core/testing';

import { ScriptStyleLoaderServiceService } from './script-style-loader-service.service';

describe('ScriptStyleLoaderServiceService', () => {
  let service: ScriptStyleLoaderServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScriptStyleLoaderServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
