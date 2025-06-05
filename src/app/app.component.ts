import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { Subscription } from 'rxjs';
import { UiStateService } from './shared/ui-state.service'; // Import the service
import { ProfileComponent } from './personality/profile/profile.component'; // Import ProfileComponent

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    CommonModule, // Add CommonModule here
    ProfileComponent // Add ProfileComponent here
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'simple-pdb';
  isSidebarOpen = false;
  selectedProfileId: string | null = null;
  private profileSubscription!: Subscription;

  constructor(private uiStateService: UiStateService) {}

  ngOnInit(): void {
    this.profileSubscription = this.uiStateService.selectedProfileId$.subscribe(id => {
      this.selectedProfileId = id;
      this.isSidebarOpen = !!id; // Open sidebar if ID is not null
    });
  }

  ngOnDestroy(): void {
    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
    }
  }

  closeSidebar(): void {
    this.uiStateService.selectProfile(null); // Set selected ID to null to close sidebar
  }
}

