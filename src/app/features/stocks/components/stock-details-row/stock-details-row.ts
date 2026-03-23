import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { PriceFormatPipe } from '@shared/pipes/price-format.pipe';

@Component({
  selector: 'app-stock-details-row',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PriceFormatPipe],
  template: `
    <span class="row__label">{{ label() }}</span>
    <span class="row__value">{{ value() | priceFormat }}</span>
  `,
  styles: `
    :host {
      display: flex;
      justify-content: space-between;
      padding: 0 0.25rem;
    }

    .row__label {
      font-size: 0.75rem;
      color: var(--card-text-muted, #5a6c7d);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .row__value {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--card-text, #2c3e50);
    }
  `,
})
export class StockDetailsRow {
  label = input.required<string>();
  value = input.required<number>();
}
