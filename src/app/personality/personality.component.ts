import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonalityResponse } from './models/personality-response.model';
import { PersonalityService } from './services/personality.service';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-personality',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './personality.component.html',
  styleUrls: ['./personality.component.css']
})
export class PersonalityComponent implements OnInit {
  personalityResponse: PersonalityResponse | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private personalityService: PersonalityService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loading = true;
    // Adjust parameters as needed. Here, 'ISTJ' is used as an example.
    this.personalityService.getMbtiCharacters('ISTJ')
      .pipe(
        catchError(err => {
          this.error = 'Error fetching personality data';
          this.loading = false;
          console.error(err);
          return of(null);
        })
      )
      .subscribe((res: PersonalityResponse | null) => {
        console.log(res);
        this.loading = false;
        if (res) {
          this.personalityResponse = res;
        }
      });
  }

  goToProfile(id: number): void {
    // Navigate to the profile component with the provided id.
    // The route should be configured as something like '/profile/:id'
    this.router.navigate(['/profile', id]);
  }
}
