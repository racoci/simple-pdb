import { Routes } from '@angular/router';
import { ProfileSelectorComponent } from './profile-selector/profile-selector.component';
import { PersonalityComponent } from './personality/personality.component';
import { ProfileComponent } from './personality/profile/profile.component';
import {NpcSimulationComponent} from './npc-simulation/npc-simulation.component';

export const routes: Routes = [
  { path: 'profile-selector', component: ProfileSelectorComponent },
  { path: 'npc-simulation', component: NpcSimulationComponent },  // new route for simulation view
  { path: 'personality', component: PersonalityComponent },
  { path: 'profile/:id', component: ProfileComponent },
  { path: '**', redirectTo: 'npc-simulation' }
];
