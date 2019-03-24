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
  hardware_mapping: GpioMapping;

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
  chain_length: 1 | 2 | 3 | 4;

  /**
   * The number of parallel chains connected to the Pi.
   * Acts as a multiplier of the total number of rows.
   * @default 1
   */
  parallel: 1 | 2 | 3 | 4;

  // Set PWM bits used for output. Default is 11, but if you only deal with
  // limited comic-colors, 1 might be sufficient. Lower require less CPU and
  // increases refresh-rate.
  pwm_bits: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

  // Change the base time-unit for the on-time in the lowest
  // significant bit in nanoseconds.
  // Higher numbers provide better quality (more accurate color, less
  // ghosting), but have a negative impact on the frame rate.
  pwm_lsb_nanoseconds: number;

  // The lower bits can be time-dithered for higher refresh rate.
  pwm_dither_bits: number;

  /**
   * The initial brightness of the panel in percent.
   * @default 100
   */
  brightness: number;

  scan_mode: ScanMode;

  // Default row address type is 0, corresponding to direct setting of the
  // row, while row address type 1 is used for panels that only have A/B,
  // typically some 64x64 panels
  row_address_type: RowAddressType;

  // Type of multiplexing. 0 = direct, 1 = stripe, 2 = checker (typical 1:8)
  multiplexing: MuxType;

  // Disable the PWM hardware subsystem to create pulses.
  // Typically, you don't want to disable hardware pulsing, this is mostly
  // for debugging and figuring out if there is interference with the
  // sound system.
  // This won't do anything if output enable is not connected to GPIO 18 in
  // non-standard wirings.
  disable_hardware_pulsing: boolean;

  /**
   * Print the current refresh rate in real-time to the stderr.
   * @default false
   */
  show_refresh_rate: boolean;

  // In case the internal sequence of mapping is not "RGB", this contains the
  // real mapping. Some panels mix up these colors.
  led_rgb_sequence: 'RGB' | 'BGR' | 'BRG' | 'RBG' | 'GRB' | 'GBR';

  inverse_colors: boolean;

  /**
   * A special string representing selected pixel mappers used to match the
   * current display panel arrangement.
   *
   * Use LedMatrixUtils.encodeMappers() to conventiently get the formatted string from a
   * list of mappers.
   */
  pixel_mapper_config: string;
}

/**
 * Runtime options to simplify doing common things for many programs such as
 * dropping privileges and becoming a daemon.
 */
export interface RuntimeOptions {
  /**
   * @default 0
   */
  gpio_slowdown: number;

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
  drop_privileges: RuntimeFlag;

  /**
   * By default, the gpio is initialized for you, but if you want to manually
   * do that yourself, set this flag to false.
   * Then, you have to initialize the matrix yourself with SetGPIO().
   */
  do_gpio_init: boolean;
}

export interface LedMatrixInstance {
  brightness(brightness?: number): number;
  clear(): void;
  fill(r: number, g: number, b: number): void;
  height(): number;
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

export interface LedMatrixAddon {
  LedMatrix: LedMatrix;
}
