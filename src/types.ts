import { MatrixOptions, RuntimeOptions } from './native-types';

export interface Color {
  r: number;
  g: number;
  b: number;
}

export type Point = Record<'x' | 'y', number>;

type SyncHook = (
  this: LedMatrixInstance,
  matrix: LedMatrixInstance,
  dt: number,
  t: number
) => void;

export type ShapeOptions = {
  /** @default undefined */
  fill?: Color | number;
  /** @default matrix.fgColor() */
  stroke?: Color | number;
  /** @default 1 */
  strokeWidth?: number;
};

export type CircleOptions = ShapeOptions & Point & { r: number };

export interface LedMatrixInstance {
  afterSync(hook: SyncHook): LedMatrixInstance;

  bgColor(color: Color | number): this;
  bgColor(): Color;

  brightness(brightness: number): this;
  brightness(): number;

  center(): Point;

  clear(): this;
  clear(x0: number, y0: number, x1: number, y1: number): this;

  drawBuffer(buffer: Buffer | Uint8Array, w?: number, h?: number): this;
  drawCircle(x: number, y: number, r: number): this;
  drawFilledCircle(x: number, y: number, r: number): this;
  unstable_drawCircle(opts: CircleOptions): this;
  drawLine(x0: number, y0: number, x1: number, y1: number): this;
  drawRect(x0: number, y0: number, width: number, height: number): this;
  drawText(text: string, x: number, y: number, kerning?: number): this;

  fgColor(color: Color | number): this;
  fgColor(): Color;

  fill(): this;
  fill(x0: number, y0: number, x1: number, y1: number): this;

  font(font: FontInstance): this;
  font(): string;

  getAvailablePixelMappers(): string[];

  height(): number;

  luminanceCorrect(correct: boolean): this;
  luminanceCorrect(): boolean;

  map(cb: (coords: [number, number, number], t: number) => number): this;

  pwmBits(pwmBits: number): this;
  pwmBits(): number;

  setPixel(x: number, y: number): this;

  sync(): void;

  width(): number;
}

export interface LedMatrix {
  defaultMatrixOptions(): MatrixOptions;
  defaultRuntimeOptions(): RuntimeOptions;
  new (
    matrixOpts: MatrixOptions,
    runtimeOpts: RuntimeOptions
  ): LedMatrixInstance;
}

export interface FontInstance {
  /**
   * Return the number of pixels from the font's top to its baseline.
   */
  baseline(): number;
  /**
   * Return the number of pixels from the font's top to its bottom.
   */
  height(): number;
  /**
   * Return the name of the font.
   */
  name(): string;
  /**
   * Return the path of the font source.
   */
  path(): string;
  /**
   * Return the number of pixels spanned by a string rendered with this font.
   */
  stringWidth(str: string, kerning?: number): number;
}

export interface Font {
  // tslint:disable-next-line:callable-types
  new (name: string, path: string): FontInstance;
}

export interface LedMatrixAddon {
  isSupported: boolean;
  Font: Font;
  LedMatrix: LedMatrix;
}
