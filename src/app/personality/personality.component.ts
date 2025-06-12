import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PersonalityResponse, Profile } from './models/personality-response.model';
import { PersonalityService } from './services/personality.service';
import { PdbCategory } from './profile/models/pdb-category.enum';
import { ProfileService } from './profile/services/profile.service';
import { SearchResponseProfile, SearchResponse } from './profile/models/search-response.model';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

@Component({
  selector: 'app-personality',
  standalone: true,
  imports: [CommonModule, InfiniteScrollModule],
  templateUrl: './personality.component.html',
  styleUrls: ['./personality.component.css']
})
export class PersonalityComponent implements OnInit {
  profiles: Profile[] = [];
  loading = false;
  error: string | null = null;
  nextCursor: string | null = null;
  hasMore = true;

  // Default values can be overridden by query parameters.
  private mbti: string | null = null;
  private category: PdbCategory = PdbCategory.None;
  private query: string | null = null;
  private limit = 100;

  constructor(
    private personalityService: PersonalityService,
    private profileService: ProfileService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Subscribe to query parameters.
    this.route.queryParams.subscribe(params => {
      this.mbti = params['mbti'];
      this.category = params['category'] ? +params['category'] as PdbCategory : this.category;
      this.query = params['query'] || null;
      this.profiles = [];
      this.nextCursor = null;
      this.hasMore = true;
      this.loadProfiles();  // Load profiles with new parameters.
    });
  }

  loadProfiles(): void {
    if (!this.hasMore || this.loading) {
      return;
    }

    this.loading = true;
    if (this.query) {

      this.profileService.searchCharacters(
        this.query,
        this.limit,
        this.nextCursor || 0,
        this.category
      ).pipe(
        catchError(err => {
          this.error = 'Error fetching personality data';
          this.loading = false;
          console.error(err);
          return of(null);
        })
      )
        .subscribe(searchResponse => {
          this.loading = false;
          if (searchResponse && searchResponse.data && searchResponse.data.count != 0) {
            const filtered = searchResponse.data.results.filter(p => {
              if (!this.mbti) { return true; }
              const mbti = p.personalities.find(per => per.system === 'Four Letter')?.personality;
              return mbti?.toLowerCase() === this.mbti?.toLowerCase();
            }).map(p => {
              const mbti = p.personalities.find(per => per.system === 'Four Letter')?.personality || "";
              const enneagram = p.personalities.find(per => per.system === "Enneagram")?.personality || "";
              return ({
                id: +p.id,
                cat_id: +p.categoryID,
                comment_count: p.commentCount,
                mbti_profile: p.name,
                personality_type: `${mbti} ${enneagram}`,
                profile_id: +p.id,
                profile_image_url: p.image?.picURL,
                sub_cat_id: +p.subcatID,
                subcategory: p.subcategory,
                vote_count: p.voteCount,
                has_voted: false,
                top_analysis: {type: '', id: '', content: '', functionList: null}
              } as Profile);
            });
            console.log("Filtered: ", filtered);
            this.profiles = [...this.profiles, ...filtered];
            this.nextCursor = searchResponse.data.cursor.nextCursor || null;
            this.hasMore = !!searchResponse.data.cursor.nextCursor;
          }
        });
    } else {
      this.personalityService.getMbtiCharacters(
        this.mbti || "INTP",
        this.category,
        this.nextCursor || undefined,
        this.limit
      ).pipe(
        catchError(err => {
          this.error = 'Error fetching personality data';
          this.loading = false;
          console.error(err);
          return of(null);
        })
      )
        .subscribe(res => {
          this.loading = false;
          if (res) {
            console.log(res.profiles)
            this.profiles = [...this.profiles, ...res.profiles];
            this.nextCursor = res.cursor?.nextCursor || null;
            this.hasMore = res.more;
          }
        });
    }
  }

  onScroll(): void {
    if (this.hasMore && !this.loading) {
      this.loadProfiles();
    }
  }

  goToProfile(id: number): void {
    this.router.navigate(['/profile', id]);
  }
}
