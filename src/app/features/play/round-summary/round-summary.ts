import { Component, computed, effect, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import confetti from 'canvas-confetti';
import { ScoreboardTable } from '../../scoreboard/scoreboard-table/scoreboard-table';
import { GameStateService } from '../../../core/services/game-state';
import { Player } from '../../../core/models/game.models';
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

  private hasCelebrated = false;

  /** Every player tied for the highest total — usually one, but a shared top score is possible. */
  readonly winners = computed<Player[]>(() => {
    const step = this.gameState.currentStepData();
    if (!step || step.scores.length === 0) {
      return [];
    }
    const topTotal = Math.max(...step.scores.map((score) => score.total ?? 0));
    const winnerIds = new Set(
      step.scores.filter((score) => (score.total ?? 0) === topTotal).map((score) => score.playerId)
    );
    return this.gameState.players().filter((player) => winnerIds.has(player.id));
  });

  readonly winnerMessage = computed(() => {
    const names = this.winners().map((player) => player.name);
    if (names.length === 0) {
      return '';
    }
    if (names.length === 1) {
      return `${names[0]} heeft gewonnen.`;
    }
    const joined = `${names.slice(0, -1).join(', ')} en ${names[names.length - 1]}`;
    return `${joined} hebben allemaal gewonnen.`;
  });

  constructor() {
    effect(() => {
      if (this.isLastStep() && this.winnerMessage() && !this.hasCelebrated) {
        this.hasCelebrated = true;
        this.fireConfettiCannons();
      }
    });
  }

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

  /** Fires two confetti cannons from the bottom corners toward the middle, like party-popper streamers. */
  private fireConfettiCannons(): void {
    const durationMs = 2000;
    const end = Date.now() + durationMs;

    const frame = () => {
      confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0, y: 0.8 } });
      confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1, y: 0.8 } });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }
}
