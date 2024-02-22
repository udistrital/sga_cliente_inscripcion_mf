import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudInfoPersonaComponent } from './crud-info-persona.component';

describe('CrudInfoPersonaComponent', () => {
  let component: CrudInfoPersonaComponent;
  let fixture: ComponentFixture<CrudInfoPersonaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CrudInfoPersonaComponent]
    });
    fixture = TestBed.createComponent(CrudInfoPersonaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
