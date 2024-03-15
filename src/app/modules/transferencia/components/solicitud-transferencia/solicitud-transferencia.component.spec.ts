import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudTransferenciaComponent } from './solicitud-transferencia.component';

describe('SolicitudTransferenciaComponent', () => {
  let component: SolicitudTransferenciaComponent;
  let fixture: ComponentFixture<SolicitudTransferenciaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SolicitudTransferenciaComponent]
    });
    fixture = TestBed.createComponent(SolicitudTransferenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
