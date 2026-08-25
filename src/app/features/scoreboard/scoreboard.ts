import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ScoreboardTable } from './scoreboard-table/scoreboard-table';

@Component({
  selector: 'app-scoreboard',
  imports: [RouterLink, MatButtonModule, MatCardModule, MatIconModule, ScoreboardTable],
  templateUrl: './scoreboard.html',
  styleUrl: './scoreboard.scss',
})
export class Scoreboard {}
