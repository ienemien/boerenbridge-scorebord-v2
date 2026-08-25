import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';

import { ConfirmNewGameDialog } from './confirm-new-game-dialog';

describe('ConfirmNewGameDialog', () => {
  let component: ConfirmNewGameDialog;
  let fixture: ComponentFixture<ConfirmNewGameDialog>;
  let dialogRef: jest.Mocked<Pick<MatDialogRef<ConfirmNewGameDialog>, 'close'>>;

  beforeEach(async () => {
    dialogRef = { close: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [ConfirmNewGameDialog],
      providers: [{ provide: MatDialogRef, useValue: dialogRef }],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmNewGameDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('closes with false on cancel', () => {
    component.cancel();
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });

  it('closes with true on confirm', () => {
    component.confirm();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });
});
