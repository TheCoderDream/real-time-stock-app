import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-stock-card-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stock-card-skeleton.html',
  styleUrl: './stock-card-skeleton.scss',
})
export class StockCardSkeleton {}
