import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadPrcComponent } from './upload-prc.component';

describe('UploadPrcComponent', () => {
  let component: UploadPrcComponent;
  let fixture: ComponentFixture<UploadPrcComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UploadPrcComponent]
    });
    fixture = TestBed.createComponent(UploadPrcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
