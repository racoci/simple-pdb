import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonalityResponse, Profile } from './models/personality-response.model';
import { PersonalityService } from './services/personality.service';
import { Router } from '@angular/router';
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

  // For example, we're using 'ISTJ' with a category and a limit of 10 per request.
  private mbti = 'ENTJ';
  private category = 0;
  private limit = 50;

  constructor(
    private personalityService: PersonalityService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProfiles();  // initial load
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
          // Append the new profiles
          this.profiles = [...this.profiles, ...res.profiles];
          // Update nextCursor and hasMore flag based on API response
          this.nextCursor = res.cursor?.nextCursor || null;
          this.hasMore = res.more;
        }
      });
  }

  onScroll(): void {
    // When scrolled near bottom, load the next set of profiles if available
    if (this.hasMore && !this.loading) {
      this.loadProfiles();
    }
  }

  goToProfile(id: number): void {
    this.router.navigate(['/profile', id]);
  }
}
