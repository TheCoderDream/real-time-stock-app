import { Injectable, DestroyRef, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { StockPriceUpdate, FinnhubWsMessage, FinnhubWsOutboundMessage } from '../models/stock.model';
import { TRACKED_STOCKS } from '../stocks.config';
import { environment } from '@env';
import { resilientStream } from '@shared/operators/resilient-stream.operator';
import { isTradeMessage, mapTradeToUpdate, FinnhubTradeMessage } from '../utils/finnhub.utils';

@Injectable({ providedIn: 'root' })
export class FinnhubWebSocketService {
  readonly prices$: Observable<StockPriceUpdate>;

  private socket$: WebSocketSubject<FinnhubWsMessage | FinnhubWsOutboundMessage> | null = null;
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.prices$ = this.createFinnhubStream();
    this.destroyRef.onDestroy(() => {
      this.unsubscribeFromAllStocks();
      this.socket$?.complete();
    });
  }

  private createFinnhubStream(): Observable<StockPriceUpdate> {
    const url = `${environment.finnhub.wsUrl}?token=${environment.finnhub.apiKey}`;

    this.socket$ = webSocket<FinnhubWsMessage | FinnhubWsOutboundMessage>({
      url,
      openObserver: { next: () => this.subscribeToAllStocks() },
    });

    return this.socket$.pipe(
      resilientStream<FinnhubWsMessage | FinnhubWsOutboundMessage, FinnhubTradeMessage, StockPriceUpdate>({
        filter: isTradeMessage,
        project: (msg) => msg.data.map(mapTradeToUpdate),
        retry: { count: 5, delay: 3000 },
        destroyRef: this.destroyRef,
      })
    );
  }

  private subscribeToAllStocks(): void {
    TRACKED_STOCKS.forEach((stock) =>
      this.socket$?.next({ type: 'subscribe', symbol: stock.symbol })
    );
  }

  private unsubscribeFromAllStocks(): void {
    TRACKED_STOCKS.forEach((stock) =>
      this.socket$?.next({ type: 'unsubscribe', symbol: stock.symbol })
    );
  }
}
