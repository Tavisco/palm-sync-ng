import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadPrcComponent } from './download-prc.component';

describe('DownloadPrcComponent', () => {
  let component: DownloadPrcComponent;
  let fixture: ComponentFixture<DownloadPrcComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DownloadPrcComponent]
    });
    fixture = TestBed.createComponent(DownloadPrcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
