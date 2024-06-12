import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewInfoPersonaComponent } from './view-info-persona.component';

describe('ViewInfoPersonaComponent', () => {
  let component: ViewInfoPersonaComponent;
  let fixture: ComponentFixture<ViewInfoPersonaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewInfoPersonaComponent]
    });
    fixture = TestBed.createComponent(ViewInfoPersonaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
