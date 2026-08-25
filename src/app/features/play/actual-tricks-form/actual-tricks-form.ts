import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GameStateService } from '../../../core/services/game-state';

function range(n: number): number[] {
  return Array.from({ length: n + 1 }, (_, i) => i);
}

@Component({
  selector: 'app-actual-tricks-form',
  imports: [MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatSelectModule],
  templateUrl: './actual-tricks-form.html',
  styleUrl: './actual-tricks-form.scss',
})
export class ActualTricksForm {
  private readonly gameState = inject(GameStateService);
  private readonly snackBar = inject(MatSnackBar);

  readonly players = this.gameState.players;
  readonly step = computed(() => this.gameState.currentStepData()!);
  readonly tricksOptions = computed(() => range(this.step().nrOfCards));

  private readonly actual = signal<ReadonlyMap<number, number>>(new Map());

  chosenFor(playerId: number): number {
    return this.step().scores.find((score) => score.playerId === playerId)!.chosenTricks;
  }

  valueFor(playerId: number): number | null {
    return this.actual().get(playerId) ?? null;
  }

  select(playerId: number, value: number): void {
    this.actual.update((map) => new Map(map).set(playerId, value));
  }

  save(): void {
    const players = this.players();
    if (this.actual().size !== players.length) {
      this.snackBar.open('Er is nog niet voor alle spelers de behaalde slagen ingevoerd.', 'Ok', {
        duration: 4000,
      });
      return;
    }
    const tricks = players.map((player) => ({ playerId: player.id, value: this.actual().get(player.id)! }));
    const total = tricks.reduce((sum, trick) => sum + trick.value, 0);
    if (total !== this.step().nrOfCards) {
      const message =
        total > this.step().nrOfCards
          ? 'Het totaal aantal behaalde slagen is hoger dan het aantal kaarten.'
          : 'Het totaal aantal behaalde slagen is lager dan het aantal kaarten.';
      this.snackBar.open(message, 'Ok', { duration: 4000 });
      return;
    }
    this.gameState.saveScore(this.step().id, tricks);
  }
}
