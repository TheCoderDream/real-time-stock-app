import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-stock-card-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 class="header__symbol">{{ symbol() }}</h2>
    <span class="header__name">{{ name() }}</span>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.125rem;
    }

    .header__symbol {
      margin: 0;
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--card-text, #2c3e50);
      letter-spacing: 0.02em;
    }

    .header__name {
      font-size: 0.8rem;
      color: var(--card-text-muted, #5a6c7d);
    }
  `,
})
export class StockCardHeader {
  symbol = input.required<string>();
  name = input.required<string>();
}
