import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { EditBidsDialog } from './edit-bids-dialog';
import { Step } from '../../../core/models/game.models';
import { GameStateService } from '../../../core/services/game-state';

describe('EditBidsDialog', () => {
  let component: EditBidsDialog;
  let fixture: ComponentFixture<EditBidsDialog>;
  let dialogRef: jest.Mocked<Pick<MatDialogRef<EditBidsDialog>, 'close'>>;

  const step: Step = {
    id: 1,
    nrOfCards: 10,
    dealerId: 1,
    scores: [
      { playerId: 1, chosenTricks: 3 },
      { playerId: 2, chosenTricks: 4 },
    ],
  };

  beforeEach(async () => {
    localStorage.clear();
    dialogRef = { close: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [EditBidsDialog],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { step } },
      ],
    }).compileComponents();

    TestBed.inject(GameStateService).savePlayers([
      { id: 1, name: 'Tom' },
      { id: 2, name: 'Michiel' },
    ]);

    fixture = TestBed.createComponent(EditBidsDialog);
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
