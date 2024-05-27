import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudInfoCaracteristicaPregradoComponent } from './crud-info-caracteristica-pregrado.component';

describe('CrudInfoCaracteristicaPregradoComponent', () => {
  let component: CrudInfoCaracteristicaPregradoComponent;
  let fixture: ComponentFixture<CrudInfoCaracteristicaPregradoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CrudInfoCaracteristicaPregradoComponent]
    });
    fixture = TestBed.createComponent(CrudInfoCaracteristicaPregradoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
