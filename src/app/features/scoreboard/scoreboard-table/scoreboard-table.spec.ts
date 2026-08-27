import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreboardTable } from './scoreboard-table';
import { GameStateService } from '../../../core/services/game-state';

describe('ScoreboardTable', () => {
  let component: ScoreboardTable;
  let fixture: ComponentFixture<ScoreboardTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreboardTable],
    }).compileComponents();

    fixture = TestBed.createComponent(ScoreboardTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('ScoreboardTable rank changes', () => {
  let component: ScoreboardTable;
  let fixture: ComponentFixture<ScoreboardTable>;
  let gameState: GameStateService;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [ScoreboardTable],
    }).compileComponents();

    gameState = TestBed.inject(GameStateService);
    gameState.savePlayers([
      { id: 1, name: 'Tom' },
      { id: 2, name: 'Michiel' },
      { id: 3, name: 'Justin' },
    ]);

    // Round 1 (10 cards): Justin 1st, Tom 2nd, Michiel 3rd.
    gameState.saveChosenTricks(1, [
      { playerId: 1, value: 1 },
      { playerId: 2, value: 5 },
      { playerId: 3, value: 3 },
    ]);
    gameState.saveScore(1, [
      { playerId: 1, value: 1 }, // exact -> added 6, total 6
      { playerId: 2, value: 2 }, // miss -> added 2, total 2
      { playerId: 3, value: 7 }, // miss -> added 7, total 7
    ]);

    fixture = TestBed.createComponent(ScoreboardTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('has nothing to compare against after only one round', () => {
    expect(component.rankChangeFor(1)).toBeNull();
    expect(component.rankChangeFor(2)).toBeNull();
    expect(component.rankChangeFor(3)).toBeNull();
  });

  it('reports places gained/lost once a second round is scored', () => {
    gameState.nextStep();
    // Round 2 (9 cards): Michiel jumps to 1st, Justin drops to 2nd, Tom drops to 3rd.
    gameState.saveChosenTricks(2, [
      { playerId: 1, value: 3 },
      { playerId: 2, value: 5 },
      { playerId: 3, value: 4 },
    ]);
    gameState.saveScore(2, [
      { playerId: 1, value: 2 }, // miss -> added 2, total 8
      { playerId: 2, value: 5 }, // exact -> added 10, total 12
      { playerId: 3, value: 2 }, // miss -> added 2, total 9
    ]);
    fixture = TestBed.createComponent(ScoreboardTable);
    component = fixture.componentInstance;

    expect(component.rankChangeFor(2)).toBe(2); // Michiel: 3rd -> 1st
    expect(component.rankChangeFor(3)).toBe(-1); // Justin: 1st -> 2nd
    expect(component.rankChangeFor(1)).toBe(-1); // Tom: 2nd -> 3rd
  });
});
