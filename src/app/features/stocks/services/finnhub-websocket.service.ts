import { Injectable, DestroyRef, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { StockPriceUpdate, FinnhubWsMessage, FinnhubWsOutboundMessage } from '../models/stock.model';
import { IStockPriceService, TRACKED_STOCKS } from '../stocks.config';
import { environment } from '@env';
import { resilientStream } from '@shared/operators/resilient-stream.operator';
import { isTradeMessage, mapTradeToUpdate, FinnhubTradeMessage } from '../utils/finnhub.utils';
import { resolveActiveStates } from '../utils/active-states.utils';

@Injectable({ providedIn: 'root' })
export class FinnhubWebSocketService implements IStockPriceService {
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

  notifyToggle(symbol: string, active: boolean): void {
    this.socket$?.next({ type: active ? 'subscribe' : 'unsubscribe', symbol });
  }

  private subscribeToAllStocks(): void {
    const activeStates = resolveActiveStates(TRACKED_STOCKS.map((s) => s.symbol));
    TRACKED_STOCKS
      .filter((stock) => activeStates[stock.symbol] ?? true)
      .forEach((stock) => this.socket$?.next({ type: 'subscribe', symbol: stock.symbol }));
  }

  private unsubscribeFromAllStocks(): void {
    const activeStates = resolveActiveStates(TRACKED_STOCKS.map((s) => s.symbol));
    TRACKED_STOCKS
      .filter((stock) => activeStates[stock.symbol] ?? true)
      .forEach((stock) => this.socket$?.next({ type: 'unsubscribe', symbol: stock.symbol }));
  }
}
