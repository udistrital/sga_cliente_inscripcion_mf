import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPropuestaGradoComponent } from './view-propuesta-grado.component';

describe('ViewPropuestaGradoComponent', () => {
  let component: ViewPropuestaGradoComponent;
  let fixture: ComponentFixture<ViewPropuestaGradoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewPropuestaGradoComponent]
    });
    fixture = TestBed.createComponent(ViewPropuestaGradoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
