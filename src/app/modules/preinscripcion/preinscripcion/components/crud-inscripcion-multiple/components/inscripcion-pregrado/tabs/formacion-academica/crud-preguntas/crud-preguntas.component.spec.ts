import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudPreguntasComponent } from './crud-preguntas.component';

describe('CrudPreguntasComponent', () => {
  let component: CrudPreguntasComponent;
  let fixture: ComponentFixture<CrudPreguntasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CrudPreguntasComponent]
    });
    fixture = TestBed.createComponent(CrudPreguntasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
