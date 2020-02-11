import { Component, OnInit, ElementRef, Renderer2, Input, OnDestroy } from '@angular/core';
import { CanvasSpace, Pt, Group, CanvasForm, AnimateCallbackFn, Bound, Num, Color, World, Create, Particle } from 'pts';
import { MatrixConfig, BufferService } from '../buffer.service';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { share, filter, switchMapTo, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { SocketService } from '../socket.service';

@Component({
  selector: 'matrix-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent implements OnInit, OnDestroy {
  private readonly unsubscribe$ = new Subject<any>();
  private readonly ready$ = new BehaviorSubject(false);
  // private readonly pointer$ = new BehaviorSubject(new Pt(0, 0));
  // private readonly canvasRect$ = new BehaviorSubject(new ClientRect());
  private readonly ctx: CanvasRenderingContext2D;

  readonly form: CanvasForm;
  readonly space: CanvasSpace;
  readonly animate: Observable<{ t: number; dt: number }>;
  readonly pointer: Observable<Pt>;

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
      retina: false,
    });

    this.form = new CanvasForm(this.space);

    this.animate = new Observable(subscriber => {
      this.space.add((t, dt) => subscriber.next({ t: t!, dt: dt! }));
    });

    this.pointer = new Observable(subscriber => {
      let { left, top } = this.canvas.getBoundingClientRect();
      this.space.add({
        resize: () => {
          const rect = this.canvas.getBoundingClientRect();
          left = rect.left;
          top = rect.top;
          // { left, top } = rect;
          // { left, top } = this.canvas.getBoundingClientRect();
        },
        action: (t, x, y) => subscriber.next(new Pt(x - left, y - top)),
      });
    });

  }


  ngOnInit() {
    const world = new World(this.space.innerBound, 1, 100);

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
      // console.log('lets play!');
    });

    this.animate.pipe(
      takeUntil(this.unsubscribe$),
      withLatestFrom(this.pointer, ({ t, dt }, ptr) => {
        const radius = Math.round(Num.cycle((t % 1000) / 1000) * 10);
        const [x, y] = ptr.map(Math.round);
        // const color = Color.hsl(x % 360, 1, 0.5);
        this.form
          // .fill(Color.HSLtoRGB(color).toString('rgb'))
          // .point(ptr, radius, 'circle')
          .textBox([new Pt(x, y).add(radius + 5, -20), new Pt(x, y).add(100, 20)], `${x + radius}, ${y}`, 'middle');

        world.particle(0).position = new Pt(x, y);
        world.drawParticles((p, i) => {
          const color = (i === 0) ? '#fff' : ['#ff2d5d', '#42dc8e', '#2e43eb', '#ffe359'][i % 4];
          this.form.fillOnly(color).point(p, p.radius, 'circle');
        });

        world.update(dt!);

      })
    )
    .subscribe();



    this.space.add({
      start: () => {
        const pts = Create.distributeRandom(this.space.innerBound, 100);

        // Create particles and hit them with a random impulse
        for (let i = 0, len = pts.length; i < len; i++) {
          const p = new Particle(pts[i]).size((i === 0)
            ? 1
            : 1 + Math.random() * this.space.size.x / 50);
          p.hit(Num.randomRange(-50, 50), Num.randomRange(-25, 25));
          world.add(p);
        }

        // world.particle(0).lock = true; // lock it to move it by pointer later on
      },
      animate: (time, ftime) => {
      },
      action: (type, px, py) => {
      },
      resize: (bound, evt) => {
        if (world) world.bound = this.space.innerBound;
      }
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
