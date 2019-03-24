export enum ScanMode {
  Progressive = 0,
  Interlaced = 1,
}

export enum MuxType {
  Direct = 0,
  Stripe = 1,
  Checker = 2,
}

/**
 * If a runtime option is set to Disabled, it's command line flag
 * will be unavailable.
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

// Options to initialize the RGBMatrix. Also see the main README.md for
// detailed descriptions of the command line flags.
export interface MatrixOptions {
  // // Validate the options and possibly output a message to string. If
  // // "err" is NULL, outputs validation problems to stderr.
  // // Returns 'true' if all options look good.
  // bool Validate(std::string *err) const;

  // Name of the hardware mapping. Something like "regular" or "adafruit-hat"
  hardware_mapping: 'regular' | 'adafruit-hat';

  // The "rows" are the number
  // of rows supported by the display, so 32 or 16. Default: 32.
  rows: 16 | 32 | 64;

  // The "cols" are the number of columns per panel. Typically something
  // like 32, but also 64 is possible. Sometimes even 40.
  // cols * chain_length is the total length of the display, so you can
  // represent a 64 wide display as cols=32, chain=2 or cols=64, chain=1;
  // same thing, but more convenient to think of.
  cols: 16 | 32 | 40 | 64;

  // The chain_length is the number of displays daisy-chained together
  // (output of one connected to input of next). Default: 1
  chain_length: 1 | 2 | 3 | 4;

  // The number of parallel chains connected to the Pi; in old Pis with 26
  // GPIO pins, that is 1, in newer Pis with 40 interfaces pins, that can
  // also be 2 or 3. The effective number of pixels in vertical direction is
  // then thus rows * parallel. Default: 1
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

  // The initial brightness of the panel in percent. Valid range is 1..100
  // Default: 100
  brightness: number;

  // Scan mode: 0=progressive, 1=interlaced
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
  show_refresh_rate: boolean;

  // In case the internal sequence of mapping is not "RGB", this contains the
  // real mapping. Some panels mix up these colors.
  led_rgb_sequence: 'RGB' | 'BGR' | 'BRG' | 'RBG' | 'GRB' | 'GBR';
  inverse_colors: boolean;
}

/**
 * Runtime options to simplify doing common things for many programs such as
 * dropping privileges and becoming a daemon.
 */
export interface RuntimeOptions {
  gpio_slowdown: number;    // 0 = no slowdown.
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

// tslint:disable-next-line:no-empty-interface
export interface LedMatrixInstance {
  getBrightness(): number;
  setBrightness(brightness: number): number;
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
