import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { RoundSummary } from './round-summary';
import { GameStateService } from '../../../core/services/game-state';

describe('RoundSummary', () => {
  let component: RoundSummary;
  let fixture: ComponentFixture<RoundSummary>;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [RoundSummary],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(RoundSummary);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('isLastStep', false);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows a winner once the current round is fully scored', () => {
    const gameState = TestBed.inject(GameStateService);
    gameState.savePlayers([
      { id: 1, name: 'Tom' },
      { id: 2, name: 'Michiel' },
    ]);
    gameState.saveChosenTricks(1, [
      { playerId: 1, value: 5 },
      { playerId: 2, value: 4 },
    ]);
    gameState.saveScore(1, [
      { playerId: 1, value: 5 },
      { playerId: 2, value: 5 },
    ]);

    expect(component.winner()?.name).toBe('Tom');
  });

  it('resets and navigates home when a new game is confirmed', () => {
    const gameState = TestBed.inject(GameStateService);
    gameState.savePlayers([
      { id: 1, name: 'Tom' },
      { id: 2, name: 'Michiel' },
    ]);
    const router = TestBed.inject(Router);
    const navigateSpy = jest.spyOn(router, 'navigateByUrl');
    const dialog = TestBed.inject(MatDialog);
    jest.spyOn(dialog, 'open').mockReturnValue({
      afterClosed: () => of(true),
    } as ReturnType<MatDialog['open']>);

    component.startNewGame();

    expect(gameState.currentStep()).toBe(0);
    expect(navigateSpy).toHaveBeenCalledWith('/');
  });
});
