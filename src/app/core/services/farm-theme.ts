import { Injectable, effect, signal } from '@angular/core';

const STORAGE_KEY = 'FARM_THEME';

/** Easter egg: tap the toolbar title repeatedly to switch the app into a farm theme. See App.registerTitleTap(). */
@Injectable({ providedIn: 'root' })
export class FarmThemeService {
  readonly isActive = signal<boolean>(localStorage.getItem(STORAGE_KEY) === 'true');

  constructor() {
    effect(() => {
      const active = this.isActive();
      document.documentElement.classList.toggle('farm-theme', active);
      localStorage.setItem(STORAGE_KEY, String(active));
    });
  }

  toggle(): void {
    this.isActive.update((active) => !active);
  }
}
