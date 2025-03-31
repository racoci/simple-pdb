import { Routes } from '@angular/router';
import { PersonalityComponent } from './personality/personality.component';
import {ProfileComponent} from './personality/profile/profile.component';

export const routes: Routes = [
  { path: 'personality', component: PersonalityComponent },
  { path: '', redirectTo: '/personality', pathMatch: 'full' },
  { path: 'profile/:id', component: ProfileComponent }
];
