import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { EditActualTricksDialog } from './edit-actual-tricks-dialog';
import { Step } from '../../../core/models/game.models';
import { GameStateService } from '../../../core/services/game-state';

describe('EditActualTricksDialog', () => {
  let component: EditActualTricksDialog;
  let fixture: ComponentFixture<EditActualTricksDialog>;
  let dialogRef: jest.Mocked<Pick<MatDialogRef<EditActualTricksDialog>, 'close'>>;

  const step: Step = {
    id: 1,
    nrOfCards: 10,
    dealerId: 1,
    scores: [
      { playerId: 1, chosenTricks: 3, actualTricks: 3, added: 8, total: 8 },
      { playerId: 2, chosenTricks: 4, actualTricks: 7, added: 7, total: 7 },
    ],
  };

  beforeEach(async () => {
    localStorage.clear();
    dialogRef = { close: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [EditActualTricksDialog],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { step } },
      ],
    }).compileComponents();

    TestBed.inject(GameStateService).savePlayers([
      { id: 1, name: 'Tom' },
      { id: 2, name: 'Michiel' },
    ]);

    fixture = TestBed.createComponent(EditActualTricksDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('closes without saving on cancel', () => {
    component.cancel();
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });
});
