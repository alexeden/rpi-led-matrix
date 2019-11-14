import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';

@Component({
  selector: 'matrix-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent implements OnInit {

  constructor(
    private readonly elRef: ElementRef,
    private readonly renderer2: Renderer2,
    private readonly canvas: HTMLCanvasElement
  ) {
    this.renderer2.appendChild(this.elRef.nativeElement, this.canvas);
  }


  ngOnInit() {
  }

}
