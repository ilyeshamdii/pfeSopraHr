import { TestBed } from '@angular/core/testing';

import { WebsocketUserService } from './websocket-user.service';

describe('WebsocketUserService', () => {
  let service: WebsocketUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebsocketUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
