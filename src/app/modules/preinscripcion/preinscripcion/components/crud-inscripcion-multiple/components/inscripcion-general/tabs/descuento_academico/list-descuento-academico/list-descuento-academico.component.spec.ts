import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListDescuentoAcademicoComponent } from './list-descuento-academico.component';

describe('ListDescuentoAcademicoComponent', () => {
  let component: ListDescuentoAcademicoComponent;
  let fixture: ComponentFixture<ListDescuentoAcademicoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListDescuentoAcademicoComponent]
    });
    fixture = TestBed.createComponent(ListDescuentoAcademicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
