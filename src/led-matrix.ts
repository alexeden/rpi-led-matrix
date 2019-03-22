import { LedMatrixAddon, MatrixOptions, ScanMode, RowAddressType, MuxType, RuntimeOptions, RuntimeFlag } from './types';

// tslint:disable-next-line:variable-name
const LedMatrixAddon: LedMatrixAddon = require('bindings')('led-matrix');

console.log('LedMatrixAddon: ', LedMatrixAddon);

export class LedMatrix {

  static validateMatrixOptions(partialOpts: Partial<MatrixOptions> = { }): MatrixOptions {
    const opts: MatrixOptions = {
      brightness: 100,
      chain_length: 1,
      cols: 64,
      disable_hardware_pulsing: true,
      hardware_mapping: 'adafruit-hat',
      inverse_colors: false,
      led_rgb_sequence: 'RGB',
      multiplexing: MuxType.Direct,
      parallel: 1,
      pwm_bits: 11,
      pwm_dither_bits: 0,
      pwm_lsb_nanoseconds: 130,
      row_address_type: RowAddressType.Direct,
      rows: 32,
      scan_mode: ScanMode.Progressive,
      show_refresh_rate: false,
      ...partialOpts,
    };

    if (!LedMatrixAddon.validateMatrixOptions(opts)) {
      throw new Error(`Matrix options are not valid`);
    }

    return opts;
  }

  static validateRuntimeOptions(partialOpts: Partial<RuntimeOptions> = { }): RuntimeOptions {
    const opts: RuntimeOptions = {
      ...partialOpts,
      gpio_slowdown: 1,
      daemon: RuntimeFlag.Off,
      drop_privileges: RuntimeFlag.On,
      do_gpio_init: true,
    };

    if (!LedMatrixAddon.validateRuntimeOptions(opts)) {
      throw new Error(`Runtime options are not valid`);
    }

    return opts;
  }
}
