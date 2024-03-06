import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudDescuentoAcademicoComponent } from './crud-descuento-academico.component';

describe('CrudDescuentoAcademicoComponent', () => {
  let component: CrudDescuentoAcademicoComponent;
  let fixture: ComponentFixture<CrudDescuentoAcademicoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CrudDescuentoAcademicoComponent]
    });
    fixture = TestBed.createComponent(CrudDescuentoAcademicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
