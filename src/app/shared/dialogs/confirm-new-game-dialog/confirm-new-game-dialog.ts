import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-new-game-dialog',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './confirm-new-game-dialog.html',
  styleUrl: './confirm-new-game-dialog.scss',
})
export class ConfirmNewGameDialog {
  private readonly dialogRef = inject(MatDialogRef<ConfirmNewGameDialog>);

  cancel(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    this.dialogRef.close(true);
  }
}
