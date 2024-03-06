import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDescuentoAcademicoComponent } from './view-descuento-academico.component';

describe('ViewDescuentoAcademicoComponent', () => {
  let component: ViewDescuentoAcademicoComponent;
  let fixture: ComponentFixture<ViewDescuentoAcademicoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewDescuentoAcademicoComponent]
    });
    fixture = TestBed.createComponent(ViewDescuentoAcademicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
