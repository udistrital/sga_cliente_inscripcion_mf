import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudDocumentoProgramaComponent } from './crud-documento-programa.component';

describe('CrudDocumentoProgramaComponent', () => {
  let component: CrudDocumentoProgramaComponent;
  let fixture: ComponentFixture<CrudDocumentoProgramaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CrudDocumentoProgramaComponent]
    });
    fixture = TestBed.createComponent(CrudDocumentoProgramaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
