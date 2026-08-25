import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { EditRoundDialogData, Score, Step } from '../../../core/models/game.models';
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

  readonly players = this.gameState.players;
  readonly editableStepIds = this.gameState.editableStepIds;

  readonly rows = computed(() => this.gameState.steps().filter((step) => step.scores.length > 0));

  readonly standings = computed(() => {
    const latest = this.rows()
      .filter((step) => this.isFullyScored(step))
      .at(-1);
    return latest ? [...latest.scores].sort((a, b) => (b.total ?? 0) - (a.total ?? 0)) : [];
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

  playerName(playerId: number): string {
    return this.players().find((player) => player.id === playerId)?.name ?? '';
  }
}
