import { Component, computed, input } from '@angular/core';
import { DEFAULT_AVATAR_COLOR, DEFAULT_AVATAR_ICON } from '../../../core/utils/avatar';
import { Player } from '../../../core/models/game.models';

@Component({
  selector: 'app-player-avatar',
  imports: [],
  templateUrl: './player-avatar.html',
  styleUrl: './player-avatar.scss',
})
export class PlayerAvatar {
  readonly player = input.required<Player>();
  readonly size = input(28);

  readonly icon = computed(() => this.player().avatarIcon ?? DEFAULT_AVATAR_ICON);
  readonly color = computed(() => this.player().avatarColor ?? DEFAULT_AVATAR_COLOR);
}
