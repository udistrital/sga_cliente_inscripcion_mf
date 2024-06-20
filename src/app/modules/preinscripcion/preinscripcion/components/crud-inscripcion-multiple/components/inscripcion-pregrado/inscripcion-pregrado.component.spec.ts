import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InscripcionPregradoComponent } from './inscripcion-pregrado.component';

describe('InscripcionPregradoComponent', () => {
  let component: InscripcionPregradoComponent;
  let fixture: ComponentFixture<InscripcionPregradoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InscripcionPregradoComponent]
    });
    fixture = TestBed.createComponent(InscripcionPregradoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
