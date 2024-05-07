import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchmakingRequestsComponent } from './matchmaking-requests.component';

describe('MatchmakingRequestsComponent', () => {
  let component: MatchmakingRequestsComponent;
  let fixture: ComponentFixture<MatchmakingRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MatchmakingRequestsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MatchmakingRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
