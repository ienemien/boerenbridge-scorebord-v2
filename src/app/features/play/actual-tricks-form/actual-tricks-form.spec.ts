import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualTricksForm } from './actual-tricks-form';
import { GameStateService } from '../../../core/services/game-state';

describe('ActualTricksForm', () => {
  let component: ActualTricksForm;
  let fixture: ComponentFixture<ActualTricksForm>;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [ActualTricksForm],
    }).compileComponents();

    const gameState = TestBed.inject(GameStateService);
    gameState.savePlayers([
      { id: 1, name: 'Tom' },
      { id: 2, name: 'Michiel' },
    ]);
    gameState.saveChosenTricks(1, [
      { playerId: 1, value: 3 },
      { playerId: 2, value: 4 },
    ]);

    fixture = TestBed.createComponent(ActualTricksForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
