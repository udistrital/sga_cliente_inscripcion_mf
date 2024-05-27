import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewTerceroComponent } from './new-tercero.component';

describe('NewTerceroComponent', () => {
  let component: NewTerceroComponent;
  let fixture: ComponentFixture<NewTerceroComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewTerceroComponent]
    });
    fixture = TestBed.createComponent(NewTerceroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
