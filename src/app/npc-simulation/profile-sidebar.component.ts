import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProfileResponse } from '../personality/profile/models/profile-response.model';

@Component({
  selector: 'app-profile-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-sidebar.component.html',
  styleUrls: ['./profile-sidebar.component.css'],
  host: { class: 'profile-sidebar' }
})
export class ProfileSidebarComponent {
  @Input() profile!: ProfileResponse;

  constructor(private router: Router) {}

  openProfilePage(id: number): void {
    this.router.navigate(['/profile', id]).then(() => {
      console.log('Profile button clicked');
    });
  }
}
