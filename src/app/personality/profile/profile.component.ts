import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProfileService } from './services/profile.service'; // Adjust the path accordingly
import { ProfileResponse } from './models/profile-response.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileId: string = '';
  profileData: ProfileResponse | null = null;
  loading: boolean = true;
  error: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    this.profileId = this.route.snapshot.paramMap.get('id')!;
    this.fetchProfileData();
  }

  fetchProfileData(): void {
    this.profileService.fetchProfile(this.profileId).subscribe({
      next: (data: ProfileResponse) => {
        console.log('Fetched profile:', data);
        this.profileData = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching profile:', err);
        this.error = 'There was an error fetching the profile details.';
        this.loading = false;
      }
    });
  }

  goBackToSimulation(event: MouseEvent): void {
    this.router.navigate(['/npc-simulation']).then(() => {
      console.log('Navigated to npc-simulation for adding NPC.');
    });
  }
}
