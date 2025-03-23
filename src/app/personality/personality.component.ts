import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonalityResponse } from './personality-response.model';
import { PersonalityService } from './personality.service';

@Component({
  selector: 'app-personality',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './personality.component.html',
  styleUrls: ['./personality.component.css']
})
export class PersonalityComponent implements OnInit {
  personalityResponse?: PersonalityResponse;
  isLoading = false;
  error?: string;

  constructor(private personalityService: PersonalityService) {}

  ngOnInit(): void {
    this.isLoading = true;
    // For example, fetch profiles for 'ISTJ'. You can later enhance this to be dynamic.
    this.personalityService.getMbtiCharacters('ISTJ').subscribe({
      next: (response) => {
        this.personalityResponse = response;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching personality profiles', err);
        this.error = 'Failed to load personality profiles. Please try again later.';
        this.isLoading = false;
      }
    });
  }
}
