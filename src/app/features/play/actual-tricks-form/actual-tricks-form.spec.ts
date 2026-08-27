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

describe('ActualTricksForm with a non-scoring player', () => {
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
      { id: 3, name: 'Justin' },
    ]);
    gameState.saveChosenTricks(1, [
      { playerId: 1, value: 10 },
      { playerId: 2, value: 0 },
      { playerId: 3, value: 0 },
    ]);

    fixture = TestBed.createComponent(ActualTricksForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('sets everyone still unset to 0 once the total already reaches the card count', () => {
    component.select(1, 10);

    expect(component.valueFor(1)).toBe(10);
    expect(component.valueFor(2)).toBe(0);
    expect(component.valueFor(3)).toBe(0);
  });

  it('does not auto-fill while the total is still below the card count', () => {
    component.select(1, 4);

    expect(component.valueFor(1)).toBe(4);
    expect(component.valueFor(2)).toBeNull();
    expect(component.valueFor(3)).toBeNull();
  });
});
