import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { ProfileComponent } from './profile.component';
import { ProfileService } from './services/profile.service';
import { ProfileResponse } from './models/profile-response.model';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let profileService: jasmine.SpyObj<ProfileService>;
  let router: Router;

  beforeEach(async () => {
    profileService = jasmine.createSpyObj('ProfileService', ['fetchProfile']);
    await TestBed.configureTestingModule({
      imports: [ProfileComponent, RouterTestingModule],
      providers: [
        { provide: ProfileService, useValue: profileService },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load profile data on init', () => {
    const profile: ProfileResponse = {
      id: 1,
      mbti_profile: 'Test',
      wiki_description_html: '',
      profile_image_url: ''
    } as ProfileResponse;
    profileService.fetchProfile.and.returnValue(of(profile));

    fixture.detectChanges();

    expect(profileService.fetchProfile).toHaveBeenCalledWith('1');
    expect(component.profileData).toEqual(profile);
    expect(component.loading).toBeFalse();
  });

  it('should navigate back to npc simulation', async () => {
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    component.goBackToSimulation(new MouseEvent('click'));
    expect(router.navigate).toHaveBeenCalledWith(['/npc-simulation']);
  });
});
