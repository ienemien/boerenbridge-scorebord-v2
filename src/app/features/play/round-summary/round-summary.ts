import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ScoreboardTable } from '../../scoreboard/scoreboard-table/scoreboard-table';
import { GameStateService } from '../../../core/services/game-state';

@Component({
  selector: 'app-round-summary',
  imports: [MatButtonModule, MatCardModule, ScoreboardTable],
  templateUrl: './round-summary.html',
  styleUrl: './round-summary.scss',
})
export class RoundSummary {
  private readonly gameState = inject(GameStateService);

  readonly isLastStep = input.required<boolean>();

  nextRound(): void {
    this.gameState.nextStep();
  }
}
