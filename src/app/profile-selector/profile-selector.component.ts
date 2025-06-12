import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
import {PersonalityService} from '../personality/services/personality.service';
import {Profile} from '../personality/models/personality-response.model';
import {SuggestionService} from '../personality/profile/services/suggestion.service';
import { PdbCategory } from '../personality/profile/models/pdb-category.enum';


@Component({
  selector: 'app-profile-selector',
  standalone: true,
  templateUrl: 'profile-selector.component.html',
  styleUrls: ['./profile-selector.component.css'],
  imports: [
    FormsModule,
    NgForOf,
    NgIf
  ],
  
})
export class ProfileSelectorComponent implements OnInit {
  mbtiList: string[] = [
    'ISTJ','ESTJ','ISFJ','ESFJ','ESFP','ISFP','ESTP','ISTP',
    'INFJ','ENFJ','INFP','ENFP','INTP','ENTP','INTJ','ENTJ'
  ];

  categoryOptions: { label: string, value: PdbCategory }[] = [
    { label: 'Pop Culture', value: PdbCategory.PopCulture },
    { label: 'Television', value: PdbCategory.Television },
    { label: 'Movies', value: PdbCategory.Movies },
    { label: 'Sports', value: PdbCategory.Sports },
    { label: 'Cartoons', value: PdbCategory.Cartoons },
    { label: 'Anime & Manga', value: PdbCategory.AnimeManga },
    { label: 'Comics', value: PdbCategory.Comics },
    { label: 'Noteworthy', value: PdbCategory.Noteworthy },
    { label: 'Gaming', value: PdbCategory.Gaming },
    { label: 'Literature', value: PdbCategory.Literature },
    { label: 'Theatre', value: PdbCategory.Theatre },
    { label: 'Musician', value: PdbCategory.Musician },
    { label: 'Internet', value: PdbCategory.Internet },
    { label: 'The Arts', value: PdbCategory.TheArts },
    { label: 'Business', value: PdbCategory.Business },
    { label: 'Religion', value: PdbCategory.Religion },
    { label: 'Science', value: PdbCategory.Science },
    { label: 'Historical', value: PdbCategory.Historical },
    { label: 'Web Comics', value: PdbCategory.WebComics },
    { label: 'Superheroes', value: PdbCategory.Superheroes },
    { label: 'Philosophy', value: PdbCategory.Philosophy },
    { label: 'Kpop', value: PdbCategory.Kpop },
    { label: 'Traits', value: PdbCategory.Traits },
    { label: 'Plots & Archetypes', value: PdbCategory.PlotsArchetypes },
    { label: 'Concepts', value: PdbCategory.Concepts },
    { label: 'Music', value: PdbCategory.Music },
    { label: 'Franchises', value: PdbCategory.Franchises },
    { label: 'Culture', value: PdbCategory.Culture },
    { label: 'Theories', value: PdbCategory.Theories },
    { label: 'Polls (If you...)', value: PdbCategory.PollsIfYou },
    { label: 'Your Experience', value: PdbCategory.YourExperience },
    { label: 'Type Combo (Your Type)', value: PdbCategory.TypeComboYourType },
    { label: 'Ask Pdb', value: PdbCategory.AskPdb },
    { label: 'PDB Community', value: PdbCategory.PdbCommunity },
    { label: 'Nature', value: PdbCategory.Nature },
    { label: 'Technology', value: PdbCategory.Technology }
  ];

  selectedMbti: string = '';
  selectedCategory: PdbCategory = PdbCategory.None;
  searchTerm = '';
  profiles: Profile[] = [];
  filteredProfiles: Profile[] = [];
  suggestions: { id: string; name: string }[] = [];
  PdbCategory = PdbCategory;

  constructor(
    private router: Router,
    private personalityService: PersonalityService,
    private suggestionService: SuggestionService
  ) {}

  ngOnInit(): void {
    this.loadProfiles();
  }

  onSearchTermChange(): void {
    this.filterProfiles();
    this.loadSuggestions();
  }

  onFilterChange(): void {
    this.loadProfiles();
    this.loadSuggestions();
  }

  loadProfiles(): void {
    this.personalityService.getMbtiCharacters(
      this.selectedMbti,
      this.selectedCategory,
      undefined,
      50
    ).subscribe(res => {
      this.profiles = res.profiles;
      this.filterProfiles();
    });
  }

  loadSuggestions(): void {
    const term = this.searchTerm.trim();
    if (!term) {
      this.suggestions = [];
      return;
    }

    this.suggestionService.getSuggestions(term, {
      category: this.selectedCategory !== PdbCategory.None ? this.selectedCategory : undefined
    }).subscribe(res => {
      this.suggestions = res.data.results
        .filter(r => r.type === 'profile' && r.profile)
        .map(r => ({ id: r.profile!.id, name: r.profile!.name }));
    });
  }

  private filterProfiles(): void {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredProfiles = this.profiles.filter(p =>
      p.mbti_profile.toLowerCase().includes(term)
    );
  }

  onSubmit() {
    const queryParams: any = {};
    if (this.selectedMbti) {
      queryParams.mbti = this.selectedMbti;
    }
    if (this.selectedCategory !== PdbCategory.None) {
      queryParams.category = this.selectedCategory;
    }
    if (this.searchTerm.trim()) {
      queryParams.query = this.searchTerm.trim();
    }

    this.router.navigate(['/personality'], { queryParams }).then(() => {});
  }

  goToProfile(id: number): void {
    this.router.navigate(['/profile', id]);
  }
}
