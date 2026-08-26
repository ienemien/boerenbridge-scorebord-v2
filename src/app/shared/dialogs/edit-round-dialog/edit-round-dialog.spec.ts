import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { EditRoundDialog } from './edit-round-dialog';
import { GameStateService } from '../../../core/services/game-state';

describe('EditRoundDialog', () => {
  let fixture: ComponentFixture<EditRoundDialog>;
  let component: EditRoundDialog;
  let dialogRef: jest.Mocked<Pick<MatDialogRef<EditRoundDialog>, 'close'>>;
  let gameState: GameStateService;

  beforeEach(async () => {
    localStorage.clear();
    dialogRef = { close: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [EditRoundDialog],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        {
          provide: MAT_DIALOG_DATA,
          useFactory: (gameStateService: GameStateService) => ({ step: gameStateService.steps()[0] }),
          deps: [GameStateService],
        },
      ],
    }).compileComponents();

    gameState = TestBed.inject(GameStateService);
    gameState.savePlayers([
      { id: 1, name: 'Tom' },
      { id: 2, name: 'Michiel' },
    ]);
    gameState.saveChosenTricks(1, [
      { playerId: 1, value: 3 },
      { playerId: 2, value: 4 },
    ]);
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(EditRoundDialog);
    component = fixture.componentInstance;
  }

  it('should create', () => {
    createComponent();
    expect(component).toBeTruthy();
  });

  it('only offers the bids tab when actual tricks have not been entered yet', () => {
    createComponent();

    expect(component.canEditActualTricks).toBe(false);
    expect(component.activeTab()).toBe('bids');
  });

  it('defaults to the actual-tricks tab and allows switching once both are entered', () => {
    gameState.saveScore(1, [
      { playerId: 1, value: 3 },
      { playerId: 2, value: 7 },
    ]);
    createComponent();

    expect(component.canEditActualTricks).toBe(true);
    expect(component.activeTab()).toBe('actual');
    expect(component.valueFor(1)).toBe(3);

    component.selectTab('bids');
    expect(component.activeTab()).toBe('bids');
    expect(component.valueFor(1)).toBe(3);
    expect(component.valueFor(2)).toBe(4);
  });

  it('saves the active tab and closes the dialog', () => {
    createComponent();

    component.select(1, 2);
    component.select(2, 5);
    component.save();

    const step = gameState.steps().find((s) => s.id === 1)!;
    expect(step.scores.find((s) => s.playerId === 1)?.chosenTricks).toBe(2);
    expect(step.scores.find((s) => s.playerId === 2)?.chosenTricks).toBe(5);
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('does not close the dialog when saving is rejected by validation', () => {
    createComponent();

    component.select(1, 3);
    component.select(2, 7);
    component.save();

    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('closes without saving when the close button is used', () => {
    createComponent();
    component.close();
    expect(dialogRef.close).toHaveBeenCalled();
  });
});
