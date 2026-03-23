import {
  ApplicationConfig,
  inject,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { STOCK_PRICE_STREAM } from './features/stocks/stocks.config';
import { MockWebSocketService } from './features/stocks/services/mock-websocket.service';
import { FinnhubWebSocketService } from './features/stocks/services/finnhub-websocket.service';
import { environment } from '@env';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(withFetch()),
    provideRouter(routes),
    {
      provide: STOCK_PRICE_STREAM,
      useFactory: () => {
        const service = environment.useMock
          ? inject(MockWebSocketService)
          : inject(FinnhubWebSocketService);
        return service.prices$;
      },
    },
  ],
};
