import { TestBed } from '@angular/core/testing';

import { PaisApi } from './pais-api';

describe('PaisApi', () => {
  let service: PaisApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaisApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
