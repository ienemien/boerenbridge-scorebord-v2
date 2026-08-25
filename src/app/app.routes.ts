import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Play } from './features/play/play';
import { Scoreboard } from './features/scoreboard/scoreboard';

export const routes: Routes = [
  { path: '', component: Play },
  { path: 'home', component: Home },
  { path: 'scoreboard', component: Scoreboard },
];
