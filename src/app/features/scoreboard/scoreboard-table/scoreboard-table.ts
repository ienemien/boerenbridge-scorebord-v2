import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { EditRoundDialogData, Player, Score, Step } from '../../../core/models/game.models';
import { GameStateService } from '../../../core/services/game-state';
import { EditRoundDialog } from '../../../shared/dialogs/edit-round-dialog/edit-round-dialog';
import { PlayerAvatar } from '../../../shared/components/player-avatar/player-avatar';

@Component({
  selector: 'app-scoreboard-table',
  imports: [MatButtonModule, MatIconModule, PlayerAvatar],
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

  /** rounds() is already most-recent-first, so the first two fully-scored entries are the latest two. */
  private readonly scoredRounds = computed(() => this.rounds().filter((step) => this.isFullyScored(step)));
  private readonly latestScoredRound = computed(() => this.scoredRounds()[0]);
  private readonly previousScoredRound = computed(() => this.scoredRounds()[1]);

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

  /** Places gained (positive) or lost (negative) since the round before last; null if there's nothing to compare against yet. */
  private readonly rankChanges = computed(() => {
    const currentRanks = this.rankByPlayerId(this.latestScoredRound());
    const previousRanks = this.rankByPlayerId(this.previousScoredRound());
    const changes = new Map<number, number>();
    if (currentRanks && previousRanks) {
      for (const [playerId, rank] of currentRanks) {
        const previousRank = previousRanks.get(playerId);
        if (previousRank !== undefined) {
          changes.set(playerId, previousRank - rank);
        }
      }
    }
    return changes;
  });

  protected readonly Math = Math;

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
    this.dialog.open(EditRoundDialog, config);
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

  /** Positive = moved up that many places, negative = moved down, 0 = unchanged, null = no earlier round to compare. */
  rankChangeFor(playerId: number): number | null {
    return this.rankChanges().get(playerId) ?? null;
  }

  playerName(playerId: number): string {
    return this.gameState.players().find((player) => player.id === playerId)?.name ?? '';
  }

  /** 1 = highest total in that round. */
  private rankByPlayerId(step: Step | undefined): Map<number, number> | null {
    if (!step) {
      return null;
    }
    const sorted = [...step.scores].sort((a, b) => (b.total ?? 0) - (a.total ?? 0));
    return new Map(sorted.map((score, index) => [score.playerId, index + 1]));
  }
}
