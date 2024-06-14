import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewExamenEstadoComponent } from './view-examen-estado.component';

describe('ViewExamenEstadoComponent', () => {
  let component: ViewExamenEstadoComponent;
  let fixture: ComponentFixture<ViewExamenEstadoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewExamenEstadoComponent]
    });
    fixture = TestBed.createComponent(ViewExamenEstadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
