import { Injectable, effect, signal } from '@angular/core';

const STORAGE_KEY = 'THEME_PREFERENCE';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal<boolean>(this.loadInitialPreference());

  constructor() {
    effect(() => {
      const isDark = this.isDark();
      document.documentElement.classList.toggle('dark-theme', isDark);
      localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
    });
  }

  toggle(): void {
    this.isDark.update((isDark) => !isDark);
  }

  private loadInitialPreference(): boolean {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark') {
      return true;
    }
    if (stored === 'light') {
      return false;
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }
}
