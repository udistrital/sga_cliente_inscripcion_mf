import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudIdiomasComponent } from './crud-idiomas.component';

describe('CrudIdiomasComponent', () => {
  let component: CrudIdiomasComponent;
  let fixture: ComponentFixture<CrudIdiomasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CrudIdiomasComponent]
    });
    fixture = TestBed.createComponent(CrudIdiomasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
