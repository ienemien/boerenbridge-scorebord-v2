import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EditRoundDialogData } from '../../../core/models/game.models';
import { GameStateService } from '../../../core/services/game-state';
import { PlayerAvatar } from '../../components/player-avatar/player-avatar';

export type EditTab = 'bids' | 'actual';

function range(n: number): number[] {
  return Array.from({ length: n + 1 }, (_, i) => i);
}

@Component({
  selector: 'app-edit-round-dialog',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    PlayerAvatar,
  ],
  templateUrl: './edit-round-dialog.html',
  styleUrl: './edit-round-dialog.scss',
})
export class EditRoundDialog {
  private readonly gameState = inject(GameStateService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialogRef = inject(MatDialogRef<EditRoundDialog>);
  private readonly data = inject<EditRoundDialogData>(MAT_DIALOG_DATA);

  readonly step = this.data.step;
  readonly players = this.gameState.players;
  readonly tricksOptions = range(this.step.nrOfCards);

  /** Actual tricks are entered for all players at once, so checking one score is enough. */
  readonly canEditActualTricks = this.step.scores.every((score) => score.actualTricks !== undefined);

  readonly activeTab = signal<EditTab>(this.canEditActualTricks ? 'actual' : 'bids');

  private readonly bidValues = signal<ReadonlyMap<number, number>>(
    new Map(this.step.scores.map((score) => [score.playerId, score.chosenTricks]))
  );
  private readonly actualValues = signal<ReadonlyMap<number, number>>(
    new Map(
      this.step.scores
        .filter((score) => score.actualTricks !== undefined)
        .map((score) => [score.playerId, score.actualTricks!])
    )
  );

  readonly remaining = computed(() => {
    const total = [...this.activeValues().values()].reduce((sum, value) => sum + value, 0);
    return this.step.nrOfCards - total;
  });

  private activeValues(): ReadonlyMap<number, number> {
    return this.activeTab() === 'bids' ? this.bidValues() : this.actualValues();
  }

  selectTab(tab: EditTab): void {
    this.activeTab.set(tab);
  }

  valueFor(playerId: number): number | null {
    return this.activeValues().get(playerId) ?? null;
  }

  select(playerId: number, value: number): void {
    const target = this.activeTab() === 'bids' ? this.bidValues : this.actualValues;
    target.update((map) => new Map(map).set(playerId, value));
  }

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    const players = this.players();
    const values = this.activeValues();
    if (values.size !== players.length) {
      this.snackBar.open('Vul voor alle spelers een waarde in', 'Ok', { duration: 4000 });
      return;
    }
    const tricks = players.map((player) => ({ playerId: player.id, value: values.get(player.id)! }));
    const result =
      this.activeTab() === 'bids'
        ? this.gameState.updateRoundBids(this.step.id, tricks)
        : this.gameState.updateRoundActualTricks(this.step.id, tricks);
    if (!result.success) {
      this.snackBar.open(result.message ?? 'Aanpassing kon niet worden opgeslagen', 'Ok', { duration: 4000 });
      return;
    }
    this.dialogRef.close(true);
  }
}
