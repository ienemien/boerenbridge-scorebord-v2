import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Score, Step } from '../../../core/models/game.models';
import { GameStateService } from '../../../core/services/game-state';

type EditField = 'bids' | 'actual';

function range(n: number): number[] {
  return Array.from({ length: n + 1 }, (_, i) => i);
}

@Component({
  selector: 'app-scoreboard-table',
  imports: [MatButtonModule, MatIconModule, MatSelectModule],
  templateUrl: './scoreboard-table.html',
  styleUrl: './scoreboard-table.scss',
})
export class ScoreboardTable {
  private readonly gameState = inject(GameStateService);
  private readonly snackBar = inject(MatSnackBar);

  readonly players = this.gameState.players;
  readonly editableStepIds = this.gameState.editableStepIds;

  readonly rows = computed(() => this.gameState.steps().filter((step) => step.scores.length > 0));

  readonly standings = computed(() => {
    const latest = this.rows()
      .filter((step) => this.isFullyScored(step))
      .at(-1);
    return latest ? [...latest.scores].sort((a, b) => (b.total ?? 0) - (a.total ?? 0)) : [];
  });

  readonly editingStepId = signal<number | null>(null);
  private editingField: EditField = 'bids';
  private readonly editValues = signal<ReadonlyMap<number, number>>(new Map());

  tricksOptions(step: Step): number[] {
    return range(step.nrOfCards);
  }

  isEditable(step: Step): boolean {
    return this.editableStepIds().has(step.id);
  }

  isEditing(step: Step): boolean {
    return this.editingStepId() === step.id;
  }

  isFullyScored(step: Step): boolean {
    return step.scores.length > 0 && step.scores.every((score) => score.actualTricks !== undefined);
  }

  startEdit(step: Step): void {
    this.editingField = this.isFullyScored(step) ? 'actual' : 'bids';
    const field = this.editingField;
    this.editValues.set(
      new Map(
        step.scores.map((score) => [score.playerId, field === 'actual' ? score.actualTricks! : score.chosenTricks])
      )
    );
    this.editingStepId.set(step.id);
  }

  cancelEdit(): void {
    this.editingStepId.set(null);
  }

  editValueFor(playerId: number): number | null {
    return this.editValues().get(playerId) ?? null;
  }

  setEditValue(playerId: number, value: number): void {
    this.editValues.update((map) => new Map(map).set(playerId, value));
  }

  commitEdit(step: Step): void {
    const players = this.players();
    if (this.editValues().size !== players.length) {
      this.snackBar.open('Vul voor alle spelers een waarde in', 'Ok', { duration: 4000 });
      return;
    }
    const tricks = players.map((player) => ({ playerId: player.id, value: this.editValues().get(player.id)! }));
    const result =
      this.editingField === 'bids'
        ? this.gameState.updateRoundBids(step.id, tricks)
        : this.gameState.updateRoundActualTricks(step.id, tricks);

    if (!result.success) {
      this.snackBar.open(result.message ?? 'Aanpassing kon niet worden opgeslagen', 'Ok', { duration: 4000 });
      return;
    }
    this.editingStepId.set(null);
  }

  scoreFor(step: Step, playerId: number): Score | undefined {
    return step.scores.find((score) => score.playerId === playerId);
  }

  playerName(playerId: number): string {
    return this.players().find((player) => player.id === playerId)?.name ?? '';
  }
}
