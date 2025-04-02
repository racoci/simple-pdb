import { Routes } from '@angular/router';
import { ProfileSelectorComponent } from './profile-selector/profile-selector.component';
import { PersonalityComponent } from './personality/personality.component';
import { ProfileComponent } from './personality/profile/profile.component';

export const routes: Routes = [
  { path: '', component: ProfileSelectorComponent },
  { path: 'personality', component: PersonalityComponent },
  { path: 'profile/:id', component: ProfileComponent },
  { path: '**', redirectTo: '' }
];
