export enum ScanMode {
  Progressive = 0,
  Interlaced = 1,
}

export enum MuxType {
  Direct = 0,
  Stripe = 1,
  Checker = 2,
}

export enum PixelMapperType {
  U = 'U-mapper',
  Rotate = 'Rotate',
}

export type PixelMapper
  = { type: PixelMapperType.Rotate; angle: number }
  | { type: PixelMapperType.U };

/**
 * If a runtime option is set to Disabled, it's command line flag will be unavailable.
 */
export enum RuntimeFlag {
  Disabled = -1,
  Off = 0,
  On = 1,
}

// Default row address type is 0, corresponding to direct setting of the
// row, while row address type 1 is used for panels that only have A/B,
// typically some 64x64 panels
export enum RowAddressType {
  Direct = 0,
  AB = 1,
}

export enum GpioMapping {
  Regular = 'regular',
  AdafruitHat = 'adafruit-hat',
  AdafruitHatPwm = 'adafruit-hat-pwm',
  RegularPi1 = 'regular-pi1',
  Classic = 'classic',
  ClassicPi1 = 'classic-pi1',
}

// Options to initialize the RGBMatrix. Also see the main README.md for
// detailed descriptions of the command line flags.
export interface MatrixOptions {
  /**
   * The type of GPIO mapping of the device.
   * @default GpioMapping.Regular
   */
  hardwareMapping: GpioMapping;

  /**
   * The number of rows supported by a single display panel.
   * @default 32
   */
  rows: 16 | 32 | 64;

  /**
   * The number of columns supported by a single display panel.
   * @default 32
   */
  cols: 16 | 32 | 40 | 64;

  /**
   * The numbr of display panels daisy-chained together.
   * Acts as a multiplier of the total number of columns.
   * @default 1
   */
  chainLength: 1 | 2 | 3 | 4;

  /**
   * The number of parallel chains connected to the Pi.
   * Acts as a multiplier of the total number of rows.
   * @default 1
   */
  parallel: 1 | 2 | 3 | 4;

  // Set PWM bits used for output. Default is 11, but if you only deal with
  // limited comic-colors, 1 might be sufficient. Lower require less CPU and
  // increases refresh-rate.
  pwmBits: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

  // Change the base time-unit for the on-time in the lowest
  // significant bit in nanoseconds.
  // Higher numbers provide better quality (more accurate color, less
  // ghosting), but have a negative impact on the frame rate.
  pwmLsbNanoseconds: number;

  // The lower bits can be time-dithered for higher refresh rate.
  pwmDitherBits: number;

  /**
   * The initial brightness of the panel in percent.
   * @default 100
   */
  brightness: number;

  scanMode: ScanMode;

  // Default row address type is 0, corresponding to direct setting of the
  // row, while row address type 1 is used for panels that only have A/B,
  // typically some 64x64 panels
  rowAddressType: RowAddressType;

  // Type of multiplexing. 0 = direct, 1 = stripe, 2 = checker (typical 1:8)
  multiplexing: MuxType;

  // Disable the PWM hardware subsystem to create pulses.
  // Typically, you don't want to disable hardware pulsing, this is mostly
  // for debugging and figuring out if there is interference with the
  // sound system.
  // This won't do anything if output enable is not connected to GPIO 18 in
  // non-standard wirings.
  disableHardwarePulsing: boolean;

  /**
   * Print the current refresh rate in real-time to the stderr.
   * @default false
   */
  showRefreshRate: boolean;

  // In case the internal sequence of mapping is not "RGB", this contains the
  // real mapping. Some panels mix up these colors.
  ledRgbSequence: 'RGB' | 'BGR' | 'BRG' | 'RBG' | 'GRB' | 'GBR';

  inverseColors: boolean;

  /**
   * A special string representing selected pixel mappers used to match the
   * current display panel arrangement.
   *
   * Use LedMatrixUtils.encodeMappers() to conventiently get the formatted string from a
   * list of mappers.
   */
  pixelMapperConfig: string;
}

/**
 * Runtime options to simplify doing common things for many programs such as
 * dropping privileges and becoming a daemon.
 */
export interface RuntimeOptions {
  /**
   * @default 0
   */
  gpioSlowdown: number;

  /**
   * If daemon is Disabled, the user has to call StartRefresh() manually
   * once the matrix is created, to leave the decision to become a daemon
   * after the call (which requires that no threads have been started yet).
   * In the other cases (Off or On), the choice is already made, so the thread
   * is conveniently already started for you.
   */
  daemon: RuntimeFlag;

  /**
   * Drop privileges from 'root' to 'daemon' once the hardware is initialized.
   * This is usually a good idea unless you need to stay on elevated privs.
   */
  dropPrivileges: RuntimeFlag;

  /**
   * By default, the gpio is initialized for you, but if you want to manually
   * do that yourself, set this flag to false.
   * Then, you have to initialize the matrix yourself with SetGPIO().
   */
  doGpioInit: boolean;
}

export interface LedMatrixInstance {
  brightness(brightness?: number): number;
  clear(): void;
  fill(r: number, g: number, b: number): void;
  height(): number;
  luminanceCorrect(correct?: boolean): boolean;
  pwmBits(pwmBits?: number): number;
  setPixel(x: number, y: number, r: number, g: number, b: number): void;
  width(): number;
}

export interface LedMatrix {
  defaultMatrixOptions(): MatrixOptions;
  defaultRuntimeOptions(): RuntimeOptions;
  new(
    matrixOpts: MatrixOptions,
    runtimeOpts: RuntimeOptions
  ): LedMatrixInstance;
}

// tslint:disable-next-line:no-empty-interface
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
   * Return the number of pixels spanned by a given string.
   */
  stringWidth(str: string): number;
}

export interface Font {
  // tslint:disable-next-line:callable-types
  new (
    path: string
  ): FontInstance;
}

export interface LedMatrixAddon {
  Font: Font;
  LedMatrix: LedMatrix;
}
