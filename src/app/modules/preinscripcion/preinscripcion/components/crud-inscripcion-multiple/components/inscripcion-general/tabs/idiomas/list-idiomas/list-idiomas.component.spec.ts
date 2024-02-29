import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListIdiomasComponent } from './list-idiomas.component';

describe('ListIdiomasComponent', () => {
  let component: ListIdiomasComponent;
  let fixture: ComponentFixture<ListIdiomasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListIdiomasComponent]
    });
    fixture = TestBed.createComponent(ListIdiomasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
