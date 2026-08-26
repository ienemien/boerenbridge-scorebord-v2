import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Player } from '../../../core/models/game.models';
import { GameStateService } from '../../../core/services/game-state';
import { randomAvatar } from '../../../core/utils/avatar';
import { PlayerAvatar } from '../../../shared/components/player-avatar/player-avatar';

@Component({
  selector: 'app-player-form',
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    PlayerAvatar,
  ],
  templateUrl: './player-form.html',
  styleUrl: './player-form.scss',
})
export class PlayerForm {
  private readonly gameState = inject(GameStateService);
  private readonly snackBar = inject(MatSnackBar);

  readonly players = signal<Player[]>([]);
  readonly newPlayerName = signal('');

  addPlayer(): void {
    const name = this.newPlayerName().trim();
    if (!name) {
      return;
    }
    this.players.update((players) => [...players, this.createPlayer(players, name)]);
    this.newPlayerName.set('');
  }

  removePlayer(id: number): void {
    this.players.update((players) => players.filter((player) => player.id !== id));
  }

  startGame(): void {
    let players = this.players();
    const pendingName = this.newPlayerName().trim();
    if (pendingName) {
      players = [...players, this.createPlayer(players, pendingName)];
    }

    if (players.length < 2) {
      this.snackBar.open('Voeg ten minste 2 spelers toe', 'Ok', { duration: 4000 });
      return;
    }
    if (players.length > 8) {
      this.snackBar.open('Te veel spelers, voeg maximaal 8 spelers toe', 'Ok', { duration: 4000 });
      return;
    }
    this.gameState.savePlayers(players);
  }

  private createPlayer(players: Player[], name: string): Player {
    const avatar = randomAvatar(
      players.map((player) => player.avatarIcon ?? ''),
      players.map((player) => player.avatarColor ?? '')
    );
    return {
      id: this.nextId(players),
      name,
      avatarIcon: avatar.icon,
      avatarColor: avatar.color,
    };
  }

  private nextId(players: Player[]): number {
    return players.length > 0 ? players[players.length - 1].id + 1 : 1;
  }
}
