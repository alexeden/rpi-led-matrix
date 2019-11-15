import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject, Observable, empty } from 'rxjs';
import { switchMap, retryWhen, takeUntil, publishReplay, delay, skipUntil, filter, throttleTime, withLatestFrom, map } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { BufferService } from './buffer.service';

type Message = { };
@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private readonly url$ = new Subject<string>();
  private readonly stopSocket$ = new Subject<any>();
  private readonly retrySocket$ = new Subject<any>();
  private readonly canvasCtx$ = new Subject<CanvasRenderingContext2D>();
  private readonly connected$ = new BehaviorSubject<boolean>(false);
  readonly socketError = new Subject<Event>();
  readonly connected: Observable<boolean>;
  readonly message: Observable<ArrayBuffer>;

  socket: WebSocketSubject<ArrayBuffer> | null = null;

  constructor(
    readonly bufferService: BufferService
  ) {
    (window as any).socketService = this;

    this.connected = this.connected$.asObservable();

    this.message = this.url$.pipe(
      switchMap(url => {
        const socket = webSocket<ArrayBuffer>({
          url,
          binaryType: 'arraybuffer',
        });
        this.socket = socket;

        (window as any).socket = socket;

        return socket.multiplex(
          /* Open   */ () => this.connected$.next(true),
          /* Close  */ () => this.connected$.next(false),
          /* Filter */ () => true
        )
        .pipe(
          retryWhen(error => {
            error.subscribe(this.socketError);

            return this.retrySocket$;
          }),
          takeUntil(this.stopSocket$)
        );
      }),
      publishReplay(1)
    );

    (this.message as any).connect();

    this.canvasCtx$.pipe(
      skipUntil(this.connected$.pipe(filter(connected => connected), delay(1000))),
      throttleTime(1000 / 10),
      withLatestFrom(this.bufferService.config, (ctx, { rows, cols }) => {
        return ctx.getImageData(0, 0, cols, rows).data;
      }),
      // Filter out the alpha bytes
      map(data =>
        data.filter((_, i) => (i + 1) % 4 !== 0)
      )
    )
    .subscribe(buffer => {
      const socket = ((this.socket as any)._socket as WebSocket);
      socket.send(buffer);
    });

    // this.connected$.pipe(
    //   switchMap(connected =>
    //     !connected
    //       ? empty()
    //       : this.bufferService.buffer
    //   ),
    //   delay(100)
    // )
    // .subscribe(buffer => {
    //   console.log('socket._socket: ', (this.socket as any)._socket);
    //   if (this.socket) {
    //     const socket = ((this.socket as any)._socket as WebSocket);
    //     socket.send(buffer);

    //   }
    // });
  }

  pushCanvasCtx(ctx: CanvasRenderingContext2D) {
    this.canvasCtx$.next(ctx);
  }

  connect() {
    if (!this.connected$.getValue()) {
      this.url$.next(`wss://${location.host}/api/socket`);
    }
  }

  retryConnect() {
    this.retrySocket$.next('retrying');
  }

  disconnect() {
    this.stopSocket$.next('disconnect!');
  }
}
