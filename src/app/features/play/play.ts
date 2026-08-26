import { Component, inject } from '@angular/core';
import { GameStateService } from '../../core/services/game-state';
import { ActualTricksForm } from './actual-tricks-form/actual-tricks-form';
import { ChooseTricksForm } from './choose-tricks-form/choose-tricks-form';
import { PlayerForm } from './player-form/player-form';
import { RoundSummary } from './round-summary/round-summary';

@Component({
  selector: 'app-play',
  imports: [PlayerForm, ChooseTricksForm, ActualTricksForm, RoundSummary],
  templateUrl: './play.html',
  styleUrl: './play.scss',
})
export class Play {
  protected readonly gameState = inject(GameStateService);
}
