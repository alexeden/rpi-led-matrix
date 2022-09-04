export enum ScanMode {
  Progressive = 0,
  Interlaced = 1,
}

export enum MuxType {
  Direct = 0,
  Stripe = 1,
  Checker = 2,
  Spiral = 3,
  ZStripe = 4,
  ZnMirrorZStripe = 5,
  Coreman = 6,
  Kaler2Scan = 7,
  ZStripeUneven = 8,
  P10128x4Z = 9,
  QiangLiQ8 = 10,
  InversedZStripe = 11,
  P10Outdoor1R1G1BMultiplexMapper1 = 12,
  P10Outdoor1R1G1BMultiplexMapper2 = 13,
  P10Outdoor1R1G1BMultiplexMapper3 = 14,
  P10CoremanMapper = 15,
  P8Outdoor1R1G1BMultiplexMapper = 16,
  FlippedStripeMultiplexMapper = 17,
  P10Outdoor32x16HalfScanMapper = 18,
}

export enum PixelMapperType {
  Chainlink = 'Chainlink',
  U = 'U-mapper',
  Rotate = 'Rotate',
  V = 'V-mapper',
  VZ = 'V-mapper:Z',
}

export type PixelMapper =
  | { type: PixelMapperType.Rotate; angle: number }
  | { type: PixelMapperType.Chainlink }
  | { type: PixelMapperType.U }
  | { type: PixelMapperType.V }
  | { type: PixelMapperType.VZ };

/**
 * If a runtime option is set to Disabled, it's command line flag will be unavailable.
 */
export enum RuntimeFlag {
  Disabled = -1,
  Off = 0,
  On = 1,
}

export enum RowAddressType {
  /**
   * Corresponds to direct setting of the row.
   */
  Direct = 0,
  /**
   * Used for panels that only have A/B. (typically some 64x64 panels)
   */
  AB = 1,
  /**
   * Direct row select
   */
  DirectRow = 2,
  /**
   * ABC addressed panels
   */
  ABC = 3,
  /**
   * 4 = ABC Shift + DE direct
   */
  ABCShift = 4,
}

export enum GpioMapping {
  /**
   * The regular hardware mapping described in the wiring.md and used
   * by the adapter PCBs.
   */
  Regular = 'regular',

  /**
   * This is used if you have an Adafruit HAT in the default configuration
   */
  AdafruitHat = 'adafruit-hat',

  /**
   * An Adafruit HAT with the PWM modification
   */
  AdafruitHatPwm = 'adafruit-hat-pwm',

  /**
   * The regular pin-out, but for Raspberry Pi1. The very first Pi1 Rev1 uses
   * the same pin for GPIO-21 as later Pis use GPIO-27. Make it work for both.
   */
  RegularPi1 = 'regular-pi1',

  /**
   * Classic: Early forms of this library had this as default mapping, mostly
   * derived from the 26 GPIO-header version so that it also can work
   * on 40 Pin GPIO headers with more parallel chains.
   * Not used anymore.
   */
  Classic = 'classic',

  /**
   * Classic pin-out for Rev-A Raspberry Pi.
   */
  ClassicPi1 = 'classic-pi1',
}

export interface MatrixOptions {
  /**
   * The initial brightness of the panel in percent.
   * @default 100
   */
  brightness: number;

  /**
   * The numbr of display panels daisy-chained together.
   * Acts as a multiplier of the total number of columns.
   * @default 1
   */
  chainLength: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

  /**
   * The number of columns supported by a single display panel.
   * @default 32
   */
  cols: 16 | 32 | 40 | 64;

  /**
   * Disable the PWM hardware subsystem to create pulses.
   * Typically, you don't want to disable hardware pulsing, this is mostly
   * for debugging and figuring out if there is interference with the
   * sound system.
   * This won't do anything if output enable is not connected to GPIO 18 in
   * non-standard wirings.
   *
   * @default false
   */
  disableHardwarePulsing: boolean;

  /**
   * The type of GPIO mapping of the device.
   * @default GpioMapping.Regular
   */
  hardwareMapping: GpioMapping;

  /**
   * @default false
   */
  inverseColors: boolean;

  /**
   * In case the internal sequence of mapping is not "RGB", this contains the
   * real mapping. Some panels mix up these colors.
   *
   * @default 'RGB'
   */
  ledRgbSequence: 'RGB' | 'BGR' | 'BRG' | 'RBG' | 'GRB' | 'GBR';

  /**
   * Limit refresh rate of LED panel. This will help on a loaded system
   * to keep a constant refresh rate. <= 0 for no limit.
   */
  limitRefreshRateHz: number;

  /**
   * @default MuxType.Direct
   */
  multiplexing: MuxType;

  /**
   * Panel type. You'll almost always just want to assign this an empty string,
   * but certain panels (FM6126) require an initialization sequence.
   */
  panelType: '' | 'FM6126A' | 'FM6127';

  /**
   * The number of parallel chains connected to the Pi.
   * Acts as a multiplier of the total number of rows.
   * @default 1
   */
  parallel: 1 | 2 | 3 | 4;

  /**
   * A special string representing selected pixel mappers used to match the
   * current display panel arrangement.
   *
   * Use LedMatrixUtils.encodeMappers() to conveniently get the formatted string from a
   * list of mappers.
   *
   * @default ''
   */
  pixelMapperConfig: string;

  /**
   * Set PWM bits used for output. The maximum value is 11. Lower values
   * will increase performance at the expense of color precision.
   * @default 11
   */
  pwmBits: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

  /**
   * The lower bits can be time-dithered for higher refresh rate.
   * @default 0
   */
  pwmDitherBits: number;

  /**
   * Change the base time-unit for the on-time in the lowest
   * significant bit in nanoseconds. Higher values will provide better image quality
   * (more accurate color, less ghosting) at the expense of frame rate.
   * @default 130
   */
  pwmLsbNanoseconds: number;

  /**
   * @default RowAddressType.Direct
   */
  rowAddressType: RowAddressType;

  /**
   * The number of rows supported by a single display panel.
   * @default 32
   */
  rows: 16 | 32 | 64;

  /**
   * @default ScanMode.Progressive
   */
  scanMode: ScanMode;

  /**
   * Print the current refresh rate in real-time to the stderr.
   * @default false
   */
  showRefreshRate: boolean;
}

/**
 * Runtime options to simplify doing common things for many programs such as
 * dropping privileges and becoming a daemon.
 */
export interface RuntimeOptions {
  /**
   * If daemon is Disabled, the user has to call StartRefresh() manually
   * once the matrix is created, to leave the decision to become a daemon
   * after the call (which requires that no threads have been started yet).
   * In the other cases (Off or On), the choice is already made, so the thread
   * is conveniently already started for you.
   *
   * Not recommended unless you have a specific reason for it (e.g. you need root
   * to access other hardware or you do the privilege dropping yourself).
   *
   * @default RuntimeFlag.Off
   */
  daemon: RuntimeFlag;

  /**
   * By default, the gpio is initialized for you, but if you want to manually
   * do that yourself, set this flag to false.
   * Then, you have to initialize the matrix yourself with SetGPIO().
   *
   * @default true
   */
  doGpioInit: boolean;

  /**
   * Drop privileges from 'root' to 'daemon' once the hardware is initialized.
   * This is usually a good idea unless you need to stay on elevated privs.
   *
   * @default RuntimeFlag.On
   */
  dropPrivileges: RuntimeFlag;

  /**
   * The Raspberry Pi starting with Pi2 are putting out data too fast for almost
   * all LED panels I have seen. In this case, you want to slow down writing to
   * GPIO. Zero for this parameter means 'no slowdown'.
   *
   * The default 1 (one) typically works fine, but often you have to even go further
   * by setting it to 2 (two). If you have a Raspberry Pi with a slower processor
   * (Model A, A+, B+, Zero), then a value of 0 (zero) might work and is desirable.
   *
   * A Raspberry Pi 3 or Pi4 might even need higher values for the panels to be
   * happy.
   *
   * @default 0
   */
  gpioSlowdown: 0 | 1 | 2 | 3 | 4;
}

export interface Color {
  r: number;
  g: number;
  b: number;
}

type SyncHook = (
  this: LedMatrixInstance,
  matrix: LedMatrixInstance,
  dt: number,
  t: number
) => void;

export interface LedMatrixInstance {
  afterSync(hook: SyncHook): LedMatrixInstance;

  bgColor(color: Color | number): this;
  bgColor(): Color;

  brightness(brightness: number): this;
  brightness(): number;

  clear(): this;
  clear(x0: number, y0: number, x1: number, y1: number): this;

  drawBuffer(
    buffer: Buffer | Uint8Array,
    w?: number,
    h?: number,
    xO?: number,
    yO?: number
  ): this;
  drawCircle(x: number, y: number, r: number): this;
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
