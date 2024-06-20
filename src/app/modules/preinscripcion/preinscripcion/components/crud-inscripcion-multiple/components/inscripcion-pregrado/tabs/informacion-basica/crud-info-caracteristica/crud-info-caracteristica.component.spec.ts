import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudInfoCaracteristicaComponent } from './crud-info-caracteristica.component';

describe('CrudInfoCaracteristicaComponent', () => {
  let component: CrudInfoCaracteristicaComponent;
  let fixture: ComponentFixture<CrudInfoCaracteristicaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CrudInfoCaracteristicaComponent]
    });
    fixture = TestBed.createComponent(CrudInfoCaracteristicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
