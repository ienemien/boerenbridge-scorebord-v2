import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { GameStateService } from './core/services/game-state';
import { ThemeService } from './core/services/theme';
import { ConfirmNewGameDialog } from './shared/dialogs/confirm-new-game-dialog/confirm-new-game-dialog';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly theme = inject(ThemeService);
  private readonly gameState = inject(GameStateService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  startNewGame(): void {
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
