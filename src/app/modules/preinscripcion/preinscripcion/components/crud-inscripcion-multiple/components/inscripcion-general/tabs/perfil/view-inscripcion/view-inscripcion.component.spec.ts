import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewInscripcionComponent } from './view-inscripcion.component';

describe('ViewInscripcionComponent', () => {
  let component: ViewInscripcionComponent;
  let fixture: ComponentFixture<ViewInscripcionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewInscripcionComponent]
    });
    fixture = TestBed.createComponent(ViewInscripcionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
