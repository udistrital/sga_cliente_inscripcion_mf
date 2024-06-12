import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDocumentoProgramaComponent } from './view-documento-programa.component';

describe('ViewDocumentoProgramaComponent', () => {
  let component: ViewDocumentoProgramaComponent;
  let fixture: ComponentFixture<ViewDocumentoProgramaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewDocumentoProgramaComponent]
    });
    fixture = TestBed.createComponent(ViewDocumentoProgramaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
