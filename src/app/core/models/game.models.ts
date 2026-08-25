export interface Player {
  id: number;
  name: string;
}

export interface Score {
  playerId: number;
  chosenTricks: number;
  actualTricks?: number;
  added?: number;
  total?: number;
}

export interface Step {
  id: number;
  nrOfCards: number;
  dealerId: number;
  scores: Score[];
}

export interface GameState {
  players: Player[];
  steps: Step[];
  currentStep: number;
}

export interface TrickEntry {
  playerId: number;
  value: number;
}

export type StepView =
  | { kind: 'players' }
  | { kind: 'choose-tricks'; step: Step }
  | { kind: 'actual-tricks'; step: Step }
  | { kind: 'round-summary'; step: Step; isLastStep: boolean };

export interface UpdateResult {
  success: boolean;
  message?: string;
}

export interface EditRoundDialogData {
  step: Step;
}
