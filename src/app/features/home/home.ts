import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { GameStateService } from '../../core/services/game-state';
import { ConfirmNewGameDialog } from '../../shared/dialogs/confirm-new-game-dialog/confirm-new-game-dialog';

@Component({
  selector: 'app-home',
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly gameState = inject(GameStateService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  startNewGame(): void {
    if (this.gameState.currentStep() === 0) {
      this.router.navigateByUrl('/');
      return;
    }
    this.dialog
      .open(ConfirmNewGameDialog)
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.gameState.startNew();
          this.router.navigateByUrl('/');
        }
      });
  }
}
