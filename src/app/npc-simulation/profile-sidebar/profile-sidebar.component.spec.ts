import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ProfileSidebarComponent } from './profile-sidebar.component';
import { ProfileResponse } from '../../personality/profile/models/profile-response.model';

describe('ProfileSidebarComponent', () => {
  let component: ProfileSidebarComponent;
  let fixture: ComponentFixture<ProfileSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileSidebarComponent, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileSidebarComponent);
    component = fixture.componentInstance;
    component.profile = { id: 1 } as ProfileResponse;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
