import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadFileNuxeoComponent } from './download-file-nuxeo.component';

describe('DownloadFileNuxeoComponent', () => {
  let component: DownloadFileNuxeoComponent;
  let fixture: ComponentFixture<DownloadFileNuxeoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DownloadFileNuxeoComponent]
    });
    fixture = TestBed.createComponent(DownloadFileNuxeoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
