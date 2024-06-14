import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudIcfesComponent } from './crud-icfes.component';

describe('CrudIcfesComponent', () => {
  let component: CrudIcfesComponent;
  let fixture: ComponentFixture<CrudIcfesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CrudIcfesComponent]
    });
    fixture = TestBed.createComponent(CrudIcfesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
