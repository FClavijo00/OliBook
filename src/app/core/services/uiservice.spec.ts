import { TestBed } from '@angular/core/testing';

import { UIService } from './uiservice';

describe('UIService', () => {
  let service: UIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
