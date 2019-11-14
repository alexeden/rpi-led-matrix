import { Component, OnInit, ElementRef, Renderer2, Input } from '@angular/core';
import { CanvasSpace, Pt, Group } from 'pts';
import { MatrixConfig } from '../buffer.service';

@Component({
  selector: 'matrix-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent implements OnInit {
  @Input() config: MatrixConfig = {
    cols: 0,
    rows: 0,
  };

  readonly space: CanvasSpace;

  constructor(
    private readonly elRef: ElementRef,
    private readonly renderer2: Renderer2,
    private readonly canvas: HTMLCanvasElement
  ) {
    (window as any).canvasComponent = this;

    this.renderer2.appendChild(this.elRef.nativeElement, this.canvas);

    this.space = new CanvasSpace(this.canvas).setup({
      bgcolor: '0x000000',
      resize: false,
      retina: true,
    });
  }


  ngOnInit() {
  }

}
