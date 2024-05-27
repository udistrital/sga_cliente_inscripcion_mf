import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewProduccionAcademicaComponent } from './view-produccion-academica.component';

describe('ViewProduccionAcademicaComponent', () => {
  let component: ViewProduccionAcademicaComponent;
  let fixture: ComponentFixture<ViewProduccionAcademicaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewProduccionAcademicaComponent]
    });
    fixture = TestBed.createComponent(ViewProduccionAcademicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
