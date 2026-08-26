import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { EditRoundDialogData, Player, Score, Step } from '../../../core/models/game.models';
import { GameStateService } from '../../../core/services/game-state';
import { EditActualTricksDialog } from '../../../shared/dialogs/edit-actual-tricks-dialog/edit-actual-tricks-dialog';
import { EditBidsDialog } from '../../../shared/dialogs/edit-bids-dialog/edit-bids-dialog';

@Component({
  selector: 'app-scoreboard-table',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './scoreboard-table.html',
  styleUrl: './scoreboard-table.scss',
})
export class ScoreboardTable {
  private readonly gameState = inject(GameStateService);
  private readonly dialog = inject(MatDialog);
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly editableStepIds = this.gameState.editableStepIds;

  /** Rounds that have started, most recently played first. */
  readonly rounds = computed(() =>
    [...this.gameState.steps()].reverse().filter((step) => step.scores.length > 0)
  );

  /** rounds() is already most-recent-first, so the first fully-scored one is the latest. */
  private readonly latestScoredRound = computed(() =>
    this.rounds().find((step) => this.isFullyScored(step))
  );

  /** Players ranked by their current total, highest first. */
  readonly players = computed(() => {
    const latest = this.latestScoredRound();
    if (!latest) {
      return this.gameState.players();
    }
    const totals = new Map(latest.scores.map((score) => [score.playerId, score.total ?? 0]));
    return [...this.gameState.players()].sort(
      (a, b) => (totals.get(b.id) ?? 0) - (totals.get(a.id) ?? 0)
    );
  });

  isEditable(step: Step): boolean {
    return this.editableStepIds().has(step.id);
  }

  isFullyScored(step: Step): boolean {
    return step.scores.length > 0 && step.scores.every((score) => score.actualTricks !== undefined);
  }

  edit(step: Step): void {
    const isMobile = this.breakpointObserver.isMatched(Breakpoints.XSmall);
    const config: MatDialogConfig<EditRoundDialogData> = {
      data: { step },
      width: isMobile ? '100vw' : '480px',
      height: isMobile ? '100vh' : undefined,
      maxWidth: isMobile ? '100vw' : '90vw',
      panelClass: isMobile ? 'fullscreen-dialog' : undefined,
    };
    if (this.isFullyScored(step)) {
      this.dialog.open(EditActualTricksDialog, config);
    } else {
      this.dialog.open(EditBidsDialog, config);
    }
  }

  scoreFor(step: Step, playerId: number): Score | undefined {
    return step.scores.find((score) => score.playerId === playerId);
  }

  totalFor(player: Player): number | null {
    const latest = this.latestScoredRound();
    if (!latest) {
      return null;
    }
    return latest.scores.find((score) => score.playerId === player.id)?.total ?? null;
  }

  playerName(playerId: number): string {
    return this.gameState.players().find((player) => player.id === playerId)?.name ?? '';
  }
}
