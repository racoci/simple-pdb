import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { ProfileSelectorComponent } from './profile-selector.component';
import { PersonalityService } from '../personality/services/personality.service';
import { SuggestionService } from '../personality/profile/services/suggestion.service';
import { PdbCategory } from '../personality/profile/models/pdb-category.enum';

describe('ProfileSelectorComponent', () => {
  let component: ProfileSelectorComponent;
  let fixture: ComponentFixture<ProfileSelectorComponent>;
  let personalityService: jasmine.SpyObj<PersonalityService>;
  let suggestionService: jasmine.SpyObj<SuggestionService>;
  let router: Router;

  beforeEach(async () => {
    personalityService = jasmine.createSpyObj('PersonalityService', ['getMbtiCharacters']);
    suggestionService = jasmine.createSpyObj('SuggestionService', ['getSuggestions']);

    await TestBed.configureTestingModule({
      imports: [ProfileSelectorComponent, RouterTestingModule],
      providers: [
        { provide: PersonalityService, useValue: personalityService },
        { provide: SuggestionService, useValue: suggestionService }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(ProfileSelectorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter profiles when search term changes', () => {
    suggestionService.getSuggestions.and.returnValue(of({ data: { results: [], count: 0, cursor: { limit: 0, nextCursor: '' } }, error: { code: '', message: '', details: {} } }));
    component.profiles = [
      { id: 1, mbti_profile: 'INTP' } as any,
      { id: 2, mbti_profile: 'ENTJ' } as any
    ];
    component.searchTerm = 'intp';
    component.onSearchTermChange();
    expect(component.filteredProfiles.length).toBe(1);
    expect(component.filteredProfiles[0].mbti_profile).toBe('INTP');
  });

  it('should navigate with query params on submit', async () => {
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    component.selectedMbti = 'INTP';
    component.selectedCategory = PdbCategory.Movies;
    component.searchTerm = 'Neo';
    await component.onSubmit();
    expect(router.navigate).toHaveBeenCalledWith(['/personality'], {
      queryParams: { mbti: 'INTP', category: PdbCategory.Movies, query: 'Neo' }
    });
  });
});
