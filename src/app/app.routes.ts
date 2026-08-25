import { Routes } from '@angular/router';
import { Play } from './features/play/play';
import { Scoreboard } from './features/scoreboard/scoreboard';

export const routes: Routes = [
  { path: '', component: Play },
  { path: 'scoreboard', component: Scoreboard },
];
