import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,  // Declare as a standalone component
  imports: [CommonModule],  // Import CommonModule so *ngIf works
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileId: string = '';  // Initialized to avoid TS2564
  profileData: any;
  loading: boolean = true;
  error: string = '';

  constructor(private route: ActivatedRoute, private http: HttpClient) { }

  ngOnInit(): void {
    // Use non-null assertion because we expect 'id' to be available
    this.profileId = this.route.snapshot.paramMap.get('id')!;
    this.fetchProfileData();
  }

  fetchProfileData(): void {
    const apiUrl = `/api/v1/profile/${this.profileId}`;
    this.http.get(apiUrl).subscribe({
      next: (data) => {
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
}
