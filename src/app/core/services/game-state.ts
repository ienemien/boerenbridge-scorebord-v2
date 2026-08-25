import { Injectable, computed, effect, signal } from '@angular/core';
import { GameState, Player, Step, StepView, TrickEntry, UpdateResult } from '../models/game.models';

const STORAGE_KEY = 'GAME_STATE';

@Injectable({ providedIn: 'root' })
export class GameStateService {
  readonly players = signal<Player[]>([]);
  readonly steps = signal<Step[]>([]);
  readonly currentStep = signal<number>(0);

  readonly currentStepData = computed<Step | null>(
    () => this.steps().find((step) => step.id === this.currentStep()) ?? null
  );

  readonly view = computed<StepView>(() => {
    if (this.currentStep() === 0) {
      return { kind: 'players' };
    }
    const step = this.currentStepData();
    if (!step) {
      return { kind: 'players' };
    }
    if (step.scores.length === 0) {
      return { kind: 'choose-tricks', step };
    }
    const allScored = step.scores.every((score) => score.actualTricks !== undefined);
    if (!allScored) {
      return { kind: 'actual-tricks', step };
    }
    return { kind: 'round-summary', step, isLastStep: step.id === this.steps().length };
  });

  /** Rounds a user may still correct: the round in progress and the one just before it. */
  readonly editableStepIds = computed<Set<number>>(
    () => new Set([this.currentStep(), this.currentStep() - 1])
  );

  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const state: GameState = JSON.parse(saved);
      this.players.set(state.players);
      this.steps.set(state.steps);
      this.currentStep.set(state.currentStep);
    }

    effect(() => {
      const state: GameState = {
        players: this.players(),
        steps: this.steps(),
        currentStep: this.currentStep(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    });
  }

  startNew(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.players.set([]);
    this.steps.set([]);
    this.currentStep.set(0);
  }

  savePlayers(players: Player[]): void {
    this.players.set(players);
    this.steps.set(this.createSteps(players));
    this.currentStep.set(1);
  }

  saveChosenTricks(stepId: number, tricks: TrickEntry[]): void {
    this.steps.update((steps) =>
      steps.map((step) =>
        step.id === stepId
          ? {
              ...step,
              scores: tricks.map((trick) => ({ playerId: trick.playerId, chosenTricks: trick.value })),
            }
          : step
      )
    );
  }

  saveScore(stepId: number, tricks: TrickEntry[]): void {
    this.steps.update((steps) => {
      const prevStep = steps.find((step) => step.id === stepId - 1);
      return steps.map((step) => {
        if (step.id !== stepId) {
          return step;
        }
        const scores = step.scores.map((score) => {
          const trick = tricks.find((t) => t.playerId === score.playerId)!;
          const actualTricks = trick.value;
          const added = this.calculateAddedScore(score.chosenTricks, actualTricks);
          return {
            ...score,
            actualTricks,
            added,
            total: this.calculateTotal(prevStep, score.playerId, added),
          };
        });
        return { ...step, scores };
      });
    });
  }

  nextStep(): void {
    this.currentStep.update((step) => step + 1);
  }

  /**
   * Edit of all bids for the current or last round (a single player's bid can't be changed in
   * isolation without possibly re-breaking the "sum ≠ card count" rule, so the whole row commits
   * together, same as the original bid-entry form).
   */
  updateRoundBids(stepId: number, tricks: TrickEntry[]): UpdateResult {
    const step = this.steps().find((s) => s.id === stepId);
    if (!step) {
      return { success: false };
    }
    const total = tricks.reduce((sum, trick) => sum + trick.value, 0);
    if (total === step.nrOfCards) {
      return {
        success: false,
        message: 'Totaal van gekozen slagen mag niet gelijk zijn aan aantal kaarten',
      };
    }

    this.steps.update((steps) =>
      this.recalculateFrom(
        steps.map((s) =>
          s.id !== stepId
            ? s
            : {
                ...s,
                scores: s.scores.map((score) => {
                  const trick = tricks.find((t) => t.playerId === score.playerId);
                  return trick ? { ...score, chosenTricks: trick.value } : score;
                }),
              }
        ),
        stepId
      )
    );
    return { success: true };
  }

  /**
   * Edit of all actual-tricks values for the current or last round. A single value can't be
   * corrected on its own — the tricks must sum exactly to the card count, so an error in one
   * player's count always implies a compensating error elsewhere — so the whole row commits together.
   */
  updateRoundActualTricks(stepId: number, tricks: TrickEntry[]): UpdateResult {
    const step = this.steps().find((s) => s.id === stepId);
    if (!step) {
      return { success: false };
    }
    const total = tricks.reduce((sum, trick) => sum + trick.value, 0);
    if (total !== step.nrOfCards) {
      return {
        success: false,
        message: 'Het totaal aantal behaalde slagen moet gelijk zijn aan het aantal kaarten',
      };
    }

    this.steps.update((steps) =>
      this.recalculateFrom(
        steps.map((s) =>
          s.id !== stepId
            ? s
            : {
                ...s,
                scores: s.scores.map((score) => {
                  const trick = tricks.find((t) => t.playerId === score.playerId);
                  return trick ? { ...score, actualTricks: trick.value } : score;
                }),
              }
        ),
        stepId
      )
    );
    return { success: true };
  }

  private calculateAddedScore(chosenTricks: number, actualTricks: number): number {
    return chosenTricks === actualTricks ? 5 + actualTricks : actualTricks;
  }

  private calculateTotal(prevStep: Step | undefined, playerId: number, added: number): number {
    const prevScore = prevStep?.scores.find((score) => score.playerId === playerId);
    return prevScore?.total !== undefined ? prevScore.total + added : added;
  }

  /** Re-chains `added`/`total` forward from `fromStepId` for every already-scored round after it. */
  private recalculateFrom(steps: Step[], fromStepId: number): Step[] {
    const result = steps.map((step) => ({ ...step, scores: step.scores.map((score) => ({ ...score })) }));
    for (const step of result) {
      if (step.id < fromStepId || step.scores.length === 0) {
        continue;
      }
      const prevStep = result.find((s) => s.id === step.id - 1);
      for (const score of step.scores) {
        if (score.actualTricks === undefined) {
          continue;
        }
        score.added = this.calculateAddedScore(score.chosenTricks, score.actualTricks);
        score.total = this.calculateTotal(prevStep, score.playerId, score.added);
      }
    }
    return result;
  }

  private createSteps(players: Player[]): Step[] {
    const cardsPerPlayer = Math.floor(52 / players.length);
    const maxCards = Math.min(cardsPerPlayer, 10);
    const steps: Step[] = [];
    let id = 1;
    let dealerIndex = 0;

    for (let i = maxCards; i >= 1; i--) {
      steps.push({ id, nrOfCards: i, dealerId: players[dealerIndex].id, scores: [] });
      id++;
      dealerIndex = this.getDealerIndex(dealerIndex, players.length);
    }
    for (let i = 1; i <= maxCards; i++) {
      steps.push({ id, nrOfCards: i, dealerId: players[dealerIndex].id, scores: [] });
      id++;
      dealerIndex = this.getDealerIndex(dealerIndex, players.length);
    }

    return steps;
  }

  private getDealerIndex(dealerIndex: number, numPlayers: number): number {
    return dealerIndex + 1 < numPlayers ? dealerIndex + 1 : 0;
  }
}
