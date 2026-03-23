import { Injectable, OnDestroy, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Observable,
  retry,
  share,
  filter,
  mergeMap,
  from,
} from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import {
  StockPriceUpdate,
  FinnhubWsMessage,
  FinnhubWsOutboundMessage,
} from '../models/stock.model';
import { TRACKED_STOCKS } from '../stocks.config';
import { environment } from '@env';

type FinnhubTradeEntry = NonNullable<FinnhubWsMessage['data']>[number];
type FinnhubTradeMessage = FinnhubWsMessage & { data: NonNullable<FinnhubWsMessage['data']> };

@Injectable({ providedIn: 'root' })
export class FinnhubWebSocketService implements OnDestroy {
  readonly prices$: Observable<StockPriceUpdate>;

  private socket$: WebSocketSubject<FinnhubWsMessage | FinnhubWsOutboundMessage> | null = null;
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.prices$ = this.createFinnhubStream();
  }

  ngOnDestroy(): void {
    this.unsubscribeFromAllStocks();
    this.socket$?.complete();
  }

  private createFinnhubStream(): Observable<StockPriceUpdate> {
    const url = `${environment.finnhub.wsUrl}?token=${environment.finnhub.apiKey}`;

    this.socket$ = webSocket<FinnhubWsMessage | FinnhubWsOutboundMessage>({
      url,
      openObserver: { next: () => this.subscribeToAllStocks() },
    });

    return this.socket$.pipe(
      filter((msg): msg is FinnhubTradeMessage =>
        msg.type === 'trade' &&
        Array.isArray((msg as FinnhubWsMessage).data) &&
        ((msg as FinnhubWsMessage).data as NonNullable<FinnhubWsMessage['data']>).length > 0
      ),
      mergeMap((msg) => from(msg.data.map(FinnhubWebSocketService.mapTradeToUpdate))),
      retry({ count: 5, delay: 3000 }),
      takeUntilDestroyed(this.destroyRef),
      share(),
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

  private static mapTradeToUpdate(trade: FinnhubTradeEntry): StockPriceUpdate {
    return {
      symbol: trade.s,
      price: trade.p,
      volume: trade.v,
      timestamp: trade.t,
    };
  }
}
