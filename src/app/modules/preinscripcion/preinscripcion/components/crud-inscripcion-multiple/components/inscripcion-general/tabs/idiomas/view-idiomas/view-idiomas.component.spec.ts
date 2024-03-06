import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewIdiomasComponent } from './view-idiomas.component';

describe('ViewIdiomasComponent', () => {
  let component: ViewIdiomasComponent;
  let fixture: ComponentFixture<ViewIdiomasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewIdiomasComponent]
    });
    fixture = TestBed.createComponent(ViewIdiomasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
