import { TestBed } from '@angular/core/testing';
import { GameStateService } from './game-state';
import { Score, Step } from '../models/game.models';

function scoreFor(step: Step, playerId: number): Partial<Score> {
  const score = step.scores.find((s) => s.playerId === playerId)!;
  return {
    chosenTricks: score.chosenTricks,
    actualTricks: score.actualTricks,
    added: score.added,
    total: score.total,
  };
}

describe('GameStateService', () => {
  let service: GameStateService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameStateService);
  });

  describe('createSteps (via savePlayers)', () => {
    it('builds a symmetric round list with a dealer that rotates every round', () => {
      service.savePlayers([
        { id: 1, name: 'Tom' },
        { id: 2, name: 'Michiel' },
        { id: 3, name: 'Justin' },
      ]);

      const steps = service.steps();
      expect(steps.length).toBe(20);
      expect(steps.map((s) => s.nrOfCards)).toEqual([
        10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
      ]);
      expect(steps.map((s) => s.dealerId)).toEqual([
        1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2,
      ]);
      expect(service.currentStep()).toBe(1);
    });

    it('caps the round size at 10 cards regardless of how few players there are', () => {
      service.savePlayers([
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
      ]);

      expect(service.steps()[0].nrOfCards).toBe(10);
      expect(service.steps().length).toBe(20);
    });
  });

  describe('scoring', () => {
    beforeEach(() => {
      service.savePlayers([
        { id: 1, name: 'Tom' },
        { id: 2, name: 'Michiel' },
        { id: 3, name: 'Justin' },
      ]);
    });

    it('awards 5 + tricks for an exact bid, just tricks for a miss, and chains totals from the previous round (matches the original app\'s round19.json fixture)', () => {
      service.saveChosenTricks(1, [
        { playerId: 3, value: 4 },
        { playerId: 2, value: 1 },
        { playerId: 1, value: 2 },
      ]);
      service.saveScore(1, [
        { playerId: 3, value: 4 },
        { playerId: 2, value: 5 },
        { playerId: 1, value: 1 },
      ]);

      const step1 = service.steps().find((s) => s.id === 1)!;
      expect(scoreFor(step1, 3)).toEqual({ chosenTricks: 4, actualTricks: 4, added: 9, total: 9 });
      expect(scoreFor(step1, 2)).toEqual({ chosenTricks: 1, actualTricks: 5, added: 5, total: 5 });
      expect(scoreFor(step1, 1)).toEqual({ chosenTricks: 2, actualTricks: 1, added: 1, total: 1 });

      service.nextStep();
      service.saveChosenTricks(2, [
        { playerId: 3, value: 5 },
        { playerId: 1, value: 2 },
        { playerId: 2, value: 1 },
      ]);
      service.saveScore(2, [
        { playerId: 3, value: 4 },
        { playerId: 1, value: 2 },
        { playerId: 2, value: 3 },
      ]);

      const step2 = service.steps().find((s) => s.id === 2)!;
      expect(scoreFor(step2, 3)).toEqual({ chosenTricks: 5, actualTricks: 4, added: 4, total: 13 });
      expect(scoreFor(step2, 1)).toEqual({ chosenTricks: 2, actualTricks: 2, added: 7, total: 8 });
      expect(scoreFor(step2, 2)).toEqual({ chosenTricks: 1, actualTricks: 3, added: 3, total: 8 });
    });
  });

  describe('view', () => {
    it('walks players -> choose-tricks -> actual-tricks -> round-summary', () => {
      expect(service.view()).toEqual({ kind: 'players' });

      service.savePlayers([
        { id: 1, name: 'Tom' },
        { id: 2, name: 'Michiel' },
      ]);
      expect(service.view().kind).toBe('choose-tricks');

      service.saveChosenTricks(1, [
        { playerId: 1, value: 3 },
        { playerId: 2, value: 4 },
      ]);
      expect(service.view().kind).toBe('actual-tricks');

      service.saveScore(1, [
        { playerId: 1, value: 3 },
        { playerId: 2, value: 7 },
      ]);
      const view = service.view();
      expect(view.kind).toBe('round-summary');
      expect(view.kind === 'round-summary' && view.isLastStep).toBe(false);
    });

    it('treats a round as fully scored even when a player scores exactly 0 tricks (guards against a truthiness bug in the original app)', () => {
      service.savePlayers([
        { id: 1, name: 'Tom' },
        { id: 2, name: 'Michiel' },
      ]);
      service.saveChosenTricks(1, [
        { playerId: 1, value: 0 },
        { playerId: 2, value: 10 },
      ]);
      service.saveScore(1, [
        { playerId: 1, value: 0 },
        { playerId: 2, value: 10 },
      ]);

      expect(service.view().kind).toBe('round-summary');
    });
  });

  describe('editing the current/last round', () => {
    beforeEach(() => {
      service.savePlayers([
        { id: 1, name: 'Tom' },
        { id: 2, name: 'Michiel' },
        { id: 3, name: 'Justin' },
      ]);
      service.saveChosenTricks(1, [
        { playerId: 3, value: 4 },
        { playerId: 2, value: 1 },
        { playerId: 1, value: 2 },
      ]);
      service.saveScore(1, [
        { playerId: 3, value: 4 },
        { playerId: 2, value: 5 },
        { playerId: 1, value: 1 },
      ]);
      service.nextStep();
      service.saveChosenTricks(2, [
        { playerId: 3, value: 5 },
        { playerId: 1, value: 2 },
        { playerId: 2, value: 1 },
      ]);
      service.saveScore(2, [
        { playerId: 3, value: 4 },
        { playerId: 1, value: 2 },
        { playerId: 2, value: 3 },
      ]);
    });

    it('rejects an actual-tricks edit whose total no longer matches the card count, leaving state untouched', () => {
      const before = service.steps();
      const result = service.updateRoundActualTricks(1, [
        { playerId: 3, value: 4 },
        { playerId: 2, value: 5 },
        { playerId: 1, value: 2 }, // 4+5+2 = 11, round has 10 cards
      ]);

      expect(result.success).toBe(false);
      expect(service.steps()).toEqual(before);
    });

    it('rejects a bid edit whose total equals the card count', () => {
      const result = service.updateRoundBids(1, [
        { playerId: 3, value: 4 },
        { playerId: 2, value: 1 },
        { playerId: 1, value: 5 }, // 4+1+5 = 10, round has 10 cards
      ]);

      expect(result.success).toBe(false);
    });

    it('recalculates added/total for the edited round and cascades into the next round', () => {
      // Correct round 1: swap one trick from Justin to Tom (sum stays 10).
      const result = service.updateRoundActualTricks(1, [
        { playerId: 3, value: 3 },
        { playerId: 2, value: 5 },
        { playerId: 1, value: 2 },
      ]);
      expect(result.success).toBe(true);

      const step1 = service.steps().find((s) => s.id === 1)!;
      expect(scoreFor(step1, 3)).toEqual({ chosenTricks: 4, actualTricks: 3, added: 3, total: 3 });
      expect(scoreFor(step1, 2)).toEqual({ chosenTricks: 1, actualTricks: 5, added: 5, total: 5 });
      expect(scoreFor(step1, 1)).toEqual({ chosenTricks: 2, actualTricks: 2, added: 7, total: 7 });

      // Round 2 totals must chain off the corrected round 1 totals.
      const step2 = service.steps().find((s) => s.id === 2)!;
      expect(scoreFor(step2, 3)).toEqual({ chosenTricks: 5, actualTricks: 4, added: 4, total: 7 });
      expect(scoreFor(step2, 1)).toEqual({ chosenTricks: 2, actualTricks: 2, added: 7, total: 14 });
      expect(scoreFor(step2, 2)).toEqual({ chosenTricks: 1, actualTricks: 3, added: 3, total: 8 });
    });
  });
});
