import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewProfileInvestorComponent } from './preview-profile-investor.component';

describe('PreviewProfileInvestorComponent', () => {
  let component: PreviewProfileInvestorComponent;
  let fixture: ComponentFixture<PreviewProfileInvestorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PreviewProfileInvestorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PreviewProfileInvestorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
