import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudInscripcionMultipleComponent } from './crud-inscripcion-multiple.component';

describe('CrudInscripcionMultipleComponent', () => {
  let component: CrudInscripcionMultipleComponent;
  let fixture: ComponentFixture<CrudInscripcionMultipleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CrudInscripcionMultipleComponent]
    });
    fixture = TestBed.createComponent(CrudInscripcionMultipleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
