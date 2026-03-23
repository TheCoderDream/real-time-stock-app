import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { PriceFormatPipe } from '@shared/pipes/price-format.pipe';
import { formatChange, formatChangePercent } from '../../utils/stock.utils';

@Component({
  selector: 'app-stock-price-change',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PriceFormatPipe],
  template: `
    <div class="price">{{ currentPrice() | priceFormat }}</div>
    <div class="change">{{ changeDisplay() }}</div>
    <div class="change-percent">{{ changePercentDisplay() }}</div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .price {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--card-text, #2c3e50);
      margin-bottom: 0.125rem;
    }

    .change {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--card-text-muted, #5a6c7d);
    }

    .change-percent {
      font-size: 0.9rem;
      color: var(--card-text-muted, #5a6c7d);
      margin-bottom: 0.5rem;
    }
  `,
})
export class StockPriceChange {
  currentPrice = input.required<number>();
  change = input.required<number>();
  changePercent = input.required<number>();

  changeDisplay = computed(() => formatChange(this.change()));
  changePercentDisplay = computed(() => formatChangePercent(this.changePercent()));
}
