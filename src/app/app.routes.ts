import { Routes } from '@angular/router';
import { PersonalityComponent } from './personality/personality.component';

export const routes: Routes = [
  { path: 'personality', component: PersonalityComponent },
  { path: '', redirectTo: '/personality', pathMatch: 'full' }
];
