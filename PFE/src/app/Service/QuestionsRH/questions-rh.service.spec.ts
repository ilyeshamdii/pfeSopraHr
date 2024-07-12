import { TestBed } from '@angular/core/testing';

import { QuestionsRHService } from './questions-rh.service';

describe('QuestionsRHService', () => {
  let service: QuestionsRHService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuestionsRHService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
