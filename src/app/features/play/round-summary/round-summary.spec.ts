import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import confetti from 'canvas-confetti';

import { RoundSummary } from './round-summary';
import { GameStateService } from '../../../core/services/game-state';

jest.mock('canvas-confetti', () => ({ __esModule: true, default: jest.fn() }));

describe('RoundSummary', () => {
  let component: RoundSummary;
  let fixture: ComponentFixture<RoundSummary>;

  beforeEach(async () => {
    localStorage.clear();
    jest.mocked(confetti).mockClear();

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

    expect(component.winners().map((p) => p.name)).toEqual(['Tom']);
    expect(component.winnerMessage()).toBe('Tom heeft gewonnen.');
  });

  it('names every player tied for the highest total', () => {
    const gameState = TestBed.inject(GameStateService);
    gameState.savePlayers([
      { id: 1, name: 'Tom' },
      { id: 2, name: 'Michiel' },
      { id: 3, name: 'Justin' },
    ]);
    gameState.saveChosenTricks(1, [
      { playerId: 1, value: 5 },
      { playerId: 2, value: 5 },
      { playerId: 3, value: 0 },
    ]);
    gameState.saveScore(1, [
      { playerId: 1, value: 5 },
      { playerId: 2, value: 5 },
      { playerId: 3, value: 0 },
    ]);

    expect(component.winners().map((p) => p.name)).toEqual(['Tom', 'Michiel']);
    expect(component.winnerMessage()).toBe('Tom en Michiel hebben allemaal gewonnen.');
  });

  it('fires the confetti cannons once the game is over, but not before', () => {
    const rafSpy = jest.spyOn(window, 'requestAnimationFrame').mockReturnValue(0);
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
    TestBed.tick();
    expect(confetti).not.toHaveBeenCalled();

    fixture.componentRef.setInput('isLastStep', true);
    TestBed.tick();

    expect(confetti).toHaveBeenCalled();
    rafSpy.mockRestore();
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
