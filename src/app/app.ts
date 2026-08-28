import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { GameStateService } from './core/services/game-state';
import { FarmThemeService } from './core/services/farm-theme';
import { ThemeService } from './core/services/theme';
import { ConfirmNewGameDialog } from './shared/dialogs/confirm-new-game-dialog/confirm-new-game-dialog';

/** Number of rapid taps on the title needed to trigger the farm-theme easter egg. */
const TITLE_TAP_THRESHOLD = 7;
/** A tap resets the counter if it comes later than this after the previous one. */
const TITLE_TAP_WINDOW_MS = 1500;

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly theme = inject(ThemeService);
  protected readonly farmTheme = inject(FarmThemeService);
  private readonly gameState = inject(GameStateService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  private titleTapCount = 0;
  private lastTitleTapAt = 0;

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

  registerTitleTap(): void {
    const now = Date.now();
    this.titleTapCount = now - this.lastTitleTapAt > TITLE_TAP_WINDOW_MS ? 1 : this.titleTapCount + 1;
    this.lastTitleTapAt = now;

    if (this.titleTapCount < TITLE_TAP_THRESHOLD) {
      return;
    }
    this.titleTapCount = 0;
    this.farmTheme.toggle();
    this.snackBar.open(
      this.farmTheme.isActive() ? 'Boerenmodus geactiveerd! 🐄' : 'Boerenmodus uitgeschakeld',
      undefined,
      { duration: 2500 }
    );
  }
}
