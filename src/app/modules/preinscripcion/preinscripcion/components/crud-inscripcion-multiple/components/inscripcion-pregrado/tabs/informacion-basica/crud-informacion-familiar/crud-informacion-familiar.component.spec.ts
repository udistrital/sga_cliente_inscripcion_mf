import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudInformacionFamiliarComponent } from './crud-informacion-familiar.component';

describe('CrudInformacionFamiliarComponent', () => {
  let component: CrudInformacionFamiliarComponent;
  let fixture: ComponentFixture<CrudInformacionFamiliarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CrudInformacionFamiliarComponent]
    });
    fixture = TestBed.createComponent(CrudInformacionFamiliarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
