import { MatrixOptions, RuntimeOptions } from './native-types';

export type Point = [x: number, y: number];

export type ColorObject = Record<'r' | 'g' | 'b', number>;
export type Color = number | [r: number, g: number, b: number] | ColorObject;

export type ShapeOptions<C = Color> = {
  /**
   * @default undefined - Shape will be drawn using the current default color.
   */
  color?: C;
  /**
   * @default undefined  - Shape will not be filled.
   * If `true`, the shape will be filled using the color specified by the
   * `ShapeOptions.color` prop if defined, default color otherwise.
   */
  fill?: boolean;
};

// A spec represents the minimum information needed to draw a shape;
// some shapes, like a rectangle, can have more than one spec
export type CircleSpec = { r: number; center: Point };
export type LineSpec = { p0: Point; p1: Point };
export type PolygonSpec = { ps: Point[] };
export type RectangleSpec = { p0: Point } & (
  | { p1: Point }
  | { w: number; h: number }
);

export type CircleOptions = ShapeOptions & CircleSpec;
export type LineOptions = ShapeOptions & LineSpec;
export type PolygonOptions = ShapeOptions & PolygonSpec;
export type RectangleOptions = ShapeOptions & RectangleSpec;

export interface LedMatrixInstance {
  afterSync(hook: SyncHook): this;

  bgColor(color: Color): this;
  bgColor(): ColorObject;

  brightness(brightness: number): this;
  brightness(): number;

  center(): Point;

  clear(): this;
  clear(x0: number, y0: number, x1: number, y1: number): this;

  drawBuffer(buffer: Buffer | Uint8Array, w?: number, h?: number): this;
  drawCircle(x: number, y: number, r: number): this;
  drawLine(x0: number, y0: number, x1: number, y1: number): this;
  drawRect(x0: number, y0: number, width: number, height: number): this;
  drawText(text: string, x: number, y: number, kerning?: number): this;
  unstable_drawCircle(opts: CircleOptions): this;
  unstable_drawLine(opts: LineOptions): this;
  unstable_drawPolygon(opts: PolygonOptions): this;
  unstable_drawRectangle(opts: RectangleOptions): this;

  shapeOptions(opts: Partial<ShapeOptions>): this;
  shapeOptions(): ShapeOptions<ColorObject>;

  fgColor(color: Color): this;
  fgColor(): ColorObject;

  fill(): this;
  fill(x0: number, y0: number, x1: number, y1: number): this;

  font(font: FontInstance): this;
  font(): string;

  height(): number;

  luminanceCorrect(correct: boolean): this;
  luminanceCorrect(): boolean;

  map(
    cb: (coords: [x: number, y: number, i: number], t: number) => number
  ): this;

  mapPixels(hook?: PixelHook): this;

  pwmBits(pwmBits: number): this;
  pwmBits(): number;

  setPixel(x: number, y: number): this;

  sync(): void;

  width(): number;
}

export interface LedMatrix {
  availablePixelMappers(): string[];
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
  new (name: string, path: string): FontInstance;
}

export interface LedMatrixAddon {
  isSupported: boolean;
  Font: Font;
  LedMatrix: LedMatrix;
}

interface Pixel {
  origin: Point;
  x: number;
  y: number;
  color: number;
}

type PixelHook = (
  this: LedMatrixInstance,
  matrix: LedMatrixInstance,
  pixel: Pixel
) => Pixel | null | undefined;

type SyncHook = (
  this: LedMatrixInstance,
  matrix: LedMatrixInstance,
  dt: number,
  t: number
) => void;
