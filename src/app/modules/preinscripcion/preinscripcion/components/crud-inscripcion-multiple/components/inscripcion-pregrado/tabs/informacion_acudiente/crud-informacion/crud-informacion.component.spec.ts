import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudInformacionComponent } from './crud-informacion.component';

describe('CrudInformacionComponent', () => {
  let component: CrudInformacionComponent;
  let fixture: ComponentFixture<CrudInformacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CrudInformacionComponent]
    });
    fixture = TestBed.createComponent(CrudInformacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
