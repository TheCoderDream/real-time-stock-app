import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/stocks/components/stock-dashboard/stock-dashboard').then(
        (m) => m.StockDashboard
      ),
  },
];
