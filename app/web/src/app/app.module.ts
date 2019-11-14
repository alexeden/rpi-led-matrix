import { BrowserModule } from '@angular/platform-browser';
import { NgModule, RendererFactory2 } from '@angular/core';

import { AppComponent } from './app.component';
import { SocketService } from './socket.service';
import { BufferService } from './buffer.service';
import { CanvasComponent } from './canvas/canvas.component';

@NgModule({
  declarations: [
    AppComponent,
    CanvasComponent,
  ],
  imports: [
    BrowserModule,
  ],
  providers: [
    BufferService,
    SocketService,
    {
      provide: HTMLCanvasElement,
      deps: [RendererFactory2],
      useFactory: (rendererFactory: RendererFactory2) => {
        return rendererFactory.createRenderer(null, null).createElement('canvas');
      },
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
