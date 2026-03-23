import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { StockData, PriceDirection } from '../../models/stock.model';
import { getPriceDirection } from '../../utils/stock.utils';
import { PriceDirectionDirective } from '@shared/directives/price-direction.directive';
import { StockCardHeader } from '../stock-card-header/stock-card-header';
import { StockPriceChange } from '../stock-price-change/stock-price-change';
import { StockDetailsRow } from '../stock-details-row/stock-details-row';
import { StockToggle } from '../stock-toggle/stock-toggle';

@Component({
  selector: 'app-stock-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PriceDirectionDirective,
    StockCardHeader,
    StockPriceChange,
    StockDetailsRow,
    StockToggle,
    DatePipe,
    DecimalPipe,
  ],
  templateUrl: './stock-card.html',
  styleUrl: './stock-card.scss',
})
export class StockCard {
  stock = input.required<StockData>();
  toggleChanged = output<string>();

  direction = computed<PriceDirection>(() => getPriceDirection(this.stock()));

  onToggle(): void {
    this.toggleChanged.emit(this.stock().symbol);
  }
}
