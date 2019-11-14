import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { CanvasSpace, Pt, Group } from 'pts';

@Component({
  selector: 'matrix-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent implements OnInit {
  readonly space: CanvasSpace;

  constructor(
    private readonly elRef: ElementRef,
    private readonly renderer2: Renderer2,
    private readonly canvas: HTMLCanvasElement
  ) {
    (window as any).canvasComponent = this;

    this.renderer2.appendChild(this.elRef.nativeElement, this.canvas);

    this.space = new CanvasSpace(this.canvas).setup({
      resize: false,
      retina: true,
    });

  }


  ngOnInit() {
  }

}
