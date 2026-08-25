import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ScoreboardTable } from './scoreboard-table/scoreboard-table';

@Component({
  selector: 'app-scoreboard',
  imports: [MatCardModule, ScoreboardTable],
  templateUrl: './scoreboard.html',
  styleUrl: './scoreboard.scss',
})
export class Scoreboard {}
