import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudInformacionContactoComponent } from './crud-informacion-contacto.component';

describe('CrudInformacionContactoComponent', () => {
  let component: CrudInformacionContactoComponent;
  let fixture: ComponentFixture<CrudInformacionContactoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CrudInformacionContactoComponent]
    });
    fixture = TestBed.createComponent(CrudInformacionContactoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
