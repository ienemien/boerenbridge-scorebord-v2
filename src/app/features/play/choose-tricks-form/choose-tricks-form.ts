import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GameStateService } from '../../../core/services/game-state';

function range(n: number): number[] {
  return Array.from({ length: n + 1 }, (_, i) => i);
}

@Component({
  selector: 'app-choose-tricks-form',
  imports: [MatButtonModule, MatFormFieldModule, MatIconModule, MatSelectModule],
  templateUrl: './choose-tricks-form.html',
  styleUrl: './choose-tricks-form.scss',
})
export class ChooseTricksForm {
  private readonly gameState = inject(GameStateService);
  private readonly snackBar = inject(MatSnackBar);

  readonly players = this.gameState.players;
  readonly step = computed(() => this.gameState.currentStepData()!);
  readonly tricksOptions = computed(() => range(this.step().nrOfCards));

  private readonly chosen = signal<ReadonlyMap<number, number>>(new Map());

  readonly remaining = computed(() => {
    const total = [...this.chosen().values()].reduce((sum, value) => sum + value, 0);
    return this.step().nrOfCards - total;
  });

  valueFor(playerId: number): number | null {
    return this.chosen().get(playerId) ?? null;
  }

  select(playerId: number, value: number): void {
    this.chosen.update((chosen) => new Map(chosen).set(playerId, value));
  }

  save(): void {
    const players = this.players();
    if (this.chosen().size !== players.length) {
      this.snackBar.open('Nog niet alle spelers hebben hun slagen gekozen', 'Ok', { duration: 4000 });
      return;
    }
    const tricks = players.map((player) => ({ playerId: player.id, value: this.chosen().get(player.id)! }));
    const total = tricks.reduce((sum, trick) => sum + trick.value, 0);
    if (total === this.step().nrOfCards) {
      this.snackBar.open(
        'Totaal van gekozen slagen mag niet gelijk zijn aan aantal kaarten',
        'Ok',
        { duration: 4000 }
      );
      return;
    }
    this.gameState.saveChosenTricks(this.step().id, tricks);
  }
}
