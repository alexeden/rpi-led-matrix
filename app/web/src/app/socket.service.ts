import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject, Observable, empty } from 'rxjs';
import { switchMap, retryWhen, takeUntil, publishReplay } from 'rxjs/operators';
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
  private readonly connected$ = new BehaviorSubject<boolean>(false);
  readonly socketError = new Subject<Event>();
  readonly connected: Observable<boolean>;
  readonly message: Observable<ArrayBuffer>;

  socket: WebSocketSubject<ArrayBuffer> | null = null;

  constructor(
    readonly bufferService: BufferService
  ) {
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

    this.connected$.pipe(
      switchMap(connected =>
        !connected
          ? empty()
          : this.bufferService.buffer
      )
    )
    .subscribe(buffer => {
      if (this.socket) {
        console.log(buffer);
        this.socket.next(buffer);
      }
    });
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
