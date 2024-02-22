import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkDownloadComponent } from './link-download.component';

describe('LinkDownloadComponent', () => {
  let component: LinkDownloadComponent;
  let fixture: ComponentFixture<LinkDownloadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LinkDownloadComponent]
    });
    fixture = TestBed.createComponent(LinkDownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
