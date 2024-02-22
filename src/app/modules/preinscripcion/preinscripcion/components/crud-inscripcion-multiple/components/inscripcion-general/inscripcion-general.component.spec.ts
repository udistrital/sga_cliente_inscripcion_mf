import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InscripcionGeneralComponent } from './inscripcion-general.component';

describe('InscripcionGeneralComponent', () => {
  let component: InscripcionGeneralComponent;
  let fixture: ComponentFixture<InscripcionGeneralComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InscripcionGeneralComponent]
    });
    fixture = TestBed.createComponent(InscripcionGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
