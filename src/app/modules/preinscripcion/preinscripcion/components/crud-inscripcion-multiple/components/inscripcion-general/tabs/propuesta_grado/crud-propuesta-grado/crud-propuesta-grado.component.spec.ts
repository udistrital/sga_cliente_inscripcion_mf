import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudPropuestaGradoComponent } from './crud-propuesta-grado.component';

describe('CrudPropuestaGradoComponent', () => {
  let component: CrudPropuestaGradoComponent;
  let fixture: ComponentFixture<CrudPropuestaGradoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CrudPropuestaGradoComponent]
    });
    fixture = TestBed.createComponent(CrudPropuestaGradoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
