import { TestBed } from '@angular/core/testing';

import { ClimaApi } from './clima-api';

describe('ClimaApi', () => {
  let service: ClimaApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClimaApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
