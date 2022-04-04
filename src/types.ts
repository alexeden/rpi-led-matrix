import { MatrixOptions, RuntimeOptions } from './native-types';

export type Point = Record<'x' | 'y', number>;

export type ColorObject = Record<'r' | 'g' | 'b', number>;
export type Color = number | [r: number, g: number, b: number] | ColorObject;

export type ShapeOptions = {
  /**
   * @default undefined will use the matrix's current `fillColor`.
   * - Any `Color` will override the current `fillColor` for this shape only
   * - `false` means no stroke will be drawn at all
   */
  fill?: false | Color;
  /**
   * @default undefined will use the matrix's current `strokeColor`.
   * - Any `Color` will override the current `strokeColor` for this shape only
   * - `false` means no stroke will be drawn at all, as if `strokeWidth`
   *    had been set to zero
   */
  stroke?: false | Color;
  /**
   * @default undefined will use the matrix's current `strokeWidth`
   * Any `number` will override the current `strokeWidth`.
   * */
  strokeWidth?: number;
};

export type CircleOptions = ShapeOptions & Point & { r: number };

export interface LedMatrixInstance {
  afterSync(hook: SyncHook): LedMatrixInstance;

  bgColor(color: Color): this;
  bgColor(): ColorObject;

  brightness(brightness: number): this;
  brightness(): number;

  center(): Point;

  clear(): this;
  clear(x0: number, y0: number, x1: number, y1: number): this;

  drawBuffer(buffer: Buffer | Uint8Array, w?: number, h?: number): this;
  drawCircle(x: number, y: number, r: number): this;
  unstable_drawCircle(opts: CircleOptions): this;
  drawLine(x0: number, y0: number, x1: number, y1: number): this;
  drawRect(x0: number, y0: number, width: number, height: number): this;
  drawText(text: string, x: number, y: number, kerning?: number): this;

  fgColor(color: Color): this;
  fgColor(): ColorObject;

  fillColor(color: Color): this;
  fillColor(): ColorObject;

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

  strokeColor(color: Color): this;
  strokeColor(): ColorObject;

  strokeWidth(width: number): this;
  strokeWidth(): number;

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

type SyncHook = (
  this: LedMatrixInstance,
  matrix: LedMatrixInstance,
  dt: number,
  t: number
) => void;
