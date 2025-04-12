import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ProfileResponse } from './models/profile-response.model'; // adjust path as needed

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

  constructor(private route: ActivatedRoute, private http: HttpClient) { }

  ngOnInit(): void {
    // Expect 'id' to be available; non-null assertion is used
    this.profileId = this.route.snapshot.paramMap.get('id')!;
    this.fetchProfileData();
  }

  fetchProfileData(): void {
    const apiUrl = `/api/v1/profile/${this.profileId}`;
    this.http.get<ProfileResponse>(apiUrl).subscribe({
      next: (data: ProfileResponse) => {
        console.log(data);
        this.profileData = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error fetching profile:', err);
        this.error = 'There was an error fetching the profile details.';
        this.loading = false;
      }
    });
  }
}
