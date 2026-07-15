import { TestBed } from '@angular/core/testing';

import { SipacService } from './sipac-service';

describe('SipacService', () => {
  let service: SipacService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SipacService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
