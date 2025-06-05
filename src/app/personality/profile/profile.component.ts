import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core'; // Added Input, OnChanges, SimpleChanges
import { CommonModule } from '@angular/common';
import { ProfileService } from './services/profile.service';
import { ProfileResponse } from './models/profile-response.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnChanges { // Implement OnChanges
  @Input() profileIdInput: string | null = null; // Input property instead of reading from route
  profileData: ProfileResponse | null = null;
  loading: boolean = false; // Start as false, set true during fetch
  error: string = '';

  constructor(
    // Removed Router and ActivatedRoute as ID comes via Input
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    // Initial fetch if ID is provided on init
    if (this.profileIdInput) {
       this.fetchProfileData(this.profileIdInput);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Detect changes to the input property and fetch data
    if (changes['profileIdInput'] && changes['profileIdInput'].currentValue) {
      this.fetchProfileData(changes['profileIdInput'].currentValue);
    } else if (changes['profileIdInput'] && !changes['profileIdInput'].currentValue) {
      // Clear data if input becomes null (sidebar closes or selection changes)
      this.profileData = null;
      this.loading = false;
      this.error = '';
    }
  }

  fetchProfileData(profileId: string): void {
    this.loading = true; // Set loading true when fetching
    this.error = ''; // Clear previous errors
    this.profileData = null; // Clear previous data
    this.profileService.fetchProfile(profileId).subscribe({
      next: (data: ProfileResponse) => {
        console.log('Fetched profile for sidebar:', data);
        this.profileData = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching profile for sidebar:', err);
        this.error = 'There was an error fetching the profile details.';
        this.loading = false;
      }
    });
  }

  // Removed goBackToSimulation method as sidebar has its own close mechanism
}

