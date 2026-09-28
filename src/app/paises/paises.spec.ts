import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Paises } from './paises';

describe('Paises', () => {
  let component: Paises;
  let fixture: ComponentFixture<Paises>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Paises],
    }).compileComponents();

    fixture = TestBed.createComponent(Paises);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
