import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoDocumentosComponent } from './dialogo-documentos.component';

describe('DialogoDocumentosComponent', () => {
  let component: DialogoDocumentosComponent;
  let fixture: ComponentFixture<DialogoDocumentosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogoDocumentosComponent]
    });
    fixture = TestBed.createComponent(DialogoDocumentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
