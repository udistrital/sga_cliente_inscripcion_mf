import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonPaymentComponent } from './button-payment.component';

describe('ButtonPaymentComponent', () => {
  let component: ButtonPaymentComponent;
  let fixture: ComponentFixture<ButtonPaymentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ButtonPaymentComponent]
    });
    fixture = TestBed.createComponent(ButtonPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
