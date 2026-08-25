import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EditRoundDialogData } from '../../../core/models/game.models';
import { GameStateService } from '../../../core/services/game-state';

function range(n: number): number[] {
  return Array.from({ length: n + 1 }, (_, i) => i);
}

@Component({
  selector: 'app-edit-actual-tricks-dialog',
  imports: [MatButtonModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatSelectModule],
  templateUrl: './edit-actual-tricks-dialog.html',
  styleUrl: './edit-actual-tricks-dialog.scss',
})
export class EditActualTricksDialog {
  private readonly gameState = inject(GameStateService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialogRef = inject(MatDialogRef<EditActualTricksDialog>);
  private readonly data = inject<EditRoundDialogData>(MAT_DIALOG_DATA);

  readonly step = this.data.step;
  readonly players = this.gameState.players;
  readonly tricksOptions = range(this.step.nrOfCards);

  private readonly values = signal<ReadonlyMap<number, number>>(
    new Map(this.step.scores.map((score) => [score.playerId, score.actualTricks!]))
  );

  chosenFor(playerId: number): number {
    return this.step.scores.find((score) => score.playerId === playerId)!.chosenTricks;
  }

  valueFor(playerId: number): number | null {
    return this.values().get(playerId) ?? null;
  }

  select(playerId: number, value: number): void {
    this.values.update((map) => new Map(map).set(playerId, value));
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  save(): void {
    const players = this.players();
    if (this.values().size !== players.length) {
      this.snackBar.open('Vul voor alle spelers een waarde in', 'Ok', { duration: 4000 });
      return;
    }
    const tricks = players.map((player) => ({ playerId: player.id, value: this.values().get(player.id)! }));
    const result = this.gameState.updateRoundActualTricks(this.step.id, tricks);
    if (!result.success) {
      this.snackBar.open(result.message ?? 'Aanpassing kon niet worden opgeslagen', 'Ok', { duration: 4000 });
      return;
    }
    this.dialogRef.close(true);
  }
}
