import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListProduccionAcademicaComponent } from './list-produccion-academica.component';

describe('ListProduccionAcademicaComponent', () => {
  let component: ListProduccionAcademicaComponent;
  let fixture: ComponentFixture<ListProduccionAcademicaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListProduccionAcademicaComponent]
    });
    fixture = TestBed.createComponent(ListProduccionAcademicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
