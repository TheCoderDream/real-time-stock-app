import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { StockStateService } from '../../services/stock-state.service';
import { StockCard } from '../stock-card/stock-card';
import { StockCardSkeleton } from '../stock-card-skeleton/stock-card-skeleton';

@Component({
  selector: 'app-stock-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StockCard, StockCardSkeleton],
  templateUrl: './stock-dashboard.html',
  styleUrl: './stock-dashboard.scss',
})
export class StockDashboard {
  private readonly state = inject(StockStateService);

  readonly stocks = this.state.stocks;
  readonly isLoading = this.state.isLoading;
  readonly skeletons = Array(12);

  onToggle(symbol: string): void {
    this.state.toggleStock(symbol);
  }
}
