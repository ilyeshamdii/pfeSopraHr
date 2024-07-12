import { TestBed } from '@angular/core/testing';

import { WebsocketChatService } from './websocket-chat.service';

describe('WebsocketChatService', () => {
  let service: WebsocketChatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebsocketChatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
