import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PersonalityResponse, Profile } from './models/personality-response.model';
import { PersonalityService } from './services/personality.service';
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
  private mbti = 'ENTJ';
  private category = 0;
  private limit = 50;

  constructor(
    private personalityService: PersonalityService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Subscribe to query parameters.
    this.route.queryParams.subscribe(params => {
      this.mbti = params['mbti'] || this.mbti;
      this.category = params['category'] ? +params['category'] : this.category;
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
    this.personalityService.getMbtiCharacters(
      this.mbti,
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
      .subscribe((res: PersonalityResponse | null) => {
        this.loading = false;
        if (res) {
          this.profiles = [...this.profiles, ...res.profiles];
          this.nextCursor = res.cursor?.nextCursor || null;
          this.hasMore = res.more;
        }
      });
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
