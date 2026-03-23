import { Component, ChangeDetectionStrategy, model } from '@angular/core';

@Component({
  selector: 'app-stock-toggle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stock-toggle.html',
  styleUrl: './stock-toggle.scss',
})
export class StockToggle {
  active = model.required<boolean>();

  toggle(): void {
    this.active.set(!this.active());
  }
}
