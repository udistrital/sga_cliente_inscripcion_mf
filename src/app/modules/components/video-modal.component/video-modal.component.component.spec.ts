import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VideoModalComponent } from './video-modal.component.component';



describe('VideoModalComponent', () => {
  let component: VideoModalComponent;
  let fixture: ComponentFixture<VideoModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VideoModalComponent]
    });
    fixture = TestBed.createComponent(VideoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
