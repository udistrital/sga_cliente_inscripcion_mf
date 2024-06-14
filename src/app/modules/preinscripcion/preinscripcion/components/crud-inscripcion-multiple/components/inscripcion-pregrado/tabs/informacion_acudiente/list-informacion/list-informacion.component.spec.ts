import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListInformacionComponent } from './list-informacion.component';

describe('ListInformacionComponent', () => {
  let component: ListInformacionComponent;
  let fixture: ComponentFixture<ListInformacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListInformacionComponent]
    });
    fixture = TestBed.createComponent(ListInformacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
