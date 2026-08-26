import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ScoreboardTable } from '../../scoreboard/scoreboard-table/scoreboard-table';
import { GameStateService } from '../../../core/services/game-state';
import { ConfirmNewGameDialog } from '../../../shared/dialogs/confirm-new-game-dialog/confirm-new-game-dialog';

@Component({
  selector: 'app-round-summary',
  imports: [MatButtonModule, MatIconModule, ScoreboardTable],
  templateUrl: './round-summary.html',
  styleUrl: './round-summary.scss',
})
export class RoundSummary {
  private readonly gameState = inject(GameStateService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  readonly isLastStep = input.required<boolean>();

  readonly winner = computed(() => {
    const step = this.gameState.currentStepData();
    if (!step || step.scores.length === 0) {
      return null;
    }
    const topScore = [...step.scores].sort((a, b) => (b.total ?? 0) - (a.total ?? 0))[0];
    return this.gameState.players().find((player) => player.id === topScore.playerId) ?? null;
  });

  nextRound(): void {
    this.gameState.nextStep();
  }

  startNewGame(): void {
    this.dialog
      .open(ConfirmNewGameDialog)
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.gameState.startNew();
          this.router.navigateByUrl('/');
        }
      });
  }
}
