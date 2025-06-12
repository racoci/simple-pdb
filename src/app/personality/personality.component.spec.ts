import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { PersonalityComponent } from './personality.component';
import { PersonalityService } from './services/personality.service';
import { ProfileService } from './profile/services/profile.service';
import { ActivatedRoute } from '@angular/router';

describe('PersonalityComponent', () => {
  let component: PersonalityComponent;
  let fixture: ComponentFixture<PersonalityComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalityComponent, RouterTestingModule],
      providers: [
        { provide: PersonalityService, useValue: {} },
        { provide: ProfileService, useValue: {} },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(PersonalityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to profile on goToProfile', () => {
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    component.goToProfile(5);
    expect(router.navigate).toHaveBeenCalledWith(['/profile', 5]);
  });
});
