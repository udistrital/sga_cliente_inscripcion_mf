import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListDocumentoProgramaComponent } from './list-documento-programa.component';

describe('ListDocumentoProgramaComponent', () => {
  let component: ListDocumentoProgramaComponent;
  let fixture: ComponentFixture<ListDocumentoProgramaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListDocumentoProgramaComponent]
    });
    fixture = TestBed.createComponent(ListDocumentoProgramaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
