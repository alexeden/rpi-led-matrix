import { Component, OnInit, ElementRef, Renderer2, Input, OnDestroy } from '@angular/core';
import { CanvasSpace, Pt, Group, CanvasForm, AnimateCallbackFn, Bound, Num } from 'pts';
import { MatrixConfig, BufferService } from '../buffer.service';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { share, filter, switchMapTo, takeUntil, tap } from 'rxjs/operators';
import { SocketService } from '../socket.service';

@Component({
  selector: 'matrix-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent implements OnInit, OnDestroy {
  private readonly unsubscribe$ = new Subject<any>();
  private readonly ready$ = new BehaviorSubject(false);
  private readonly ctx: CanvasRenderingContext2D;

  readonly form: CanvasForm;
  readonly space: CanvasSpace;
  readonly animate: Observable<{ t: number; dt: number }>;

  constructor(
    private readonly elRef: ElementRef,
    private readonly renderer2: Renderer2,
    private readonly canvas: HTMLCanvasElement,
    readonly bufferService: BufferService,
    readonly socketService: SocketService
  ) {
    (window as any).canvasComponent = this;
    this.renderer2.appendChild(this.elRef.nativeElement, this.canvas);
    this.ctx = this. canvas.getContext('2d')!;

    this.space = new CanvasSpace(this.canvas, () => this.ready$.next(true)).setup({
      bgcolor: '0xFF0000',
      resize: false,
      retina: true,
    });

    this.form = new CanvasForm(this.space);

    this.animate = new Observable(subscriber => {
      this.space.add((t, dt) => subscriber.next({ t: t!, dt: dt! }));
    });
  }


  ngOnInit() {
    this.ready$.pipe(
      filter(ready => ready),
      switchMapTo(this.bufferService.config),
      tap(({ rows, cols }) => {
        console.log(`Setting canvas dimensions to ${rows}px by ${cols}px`);
        this.renderer2.setStyle(this.canvas, 'height', `${rows}px`);
        this.renderer2.setStyle(this.canvas, 'width', `${cols}px`);
        this.space.resize(new Bound(new Pt(0, 0), new Pt(cols, rows)));
      }),
      switchMapTo(this.animate),
      tap(() => this.socketService.pushCanvasCtx(this.ctx)),
      takeUntil(this.unsubscribe$)
    )
    .subscribe(config => {
    });

    this.space.add((time, ftime) => {
      const radius = Num.cycle((time! % 1000) / 1000) * 100;
      this.form.fill('#09f').point(this.space.pointer, radius, 'circle');
    });
    this.space.bindMouse().play();
  }


  ngOnDestroy() {
    this.ready$.unsubscribe();
    this.space.removeAll();
    this.space.stop();
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
  }
}