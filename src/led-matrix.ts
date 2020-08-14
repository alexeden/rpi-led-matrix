import { LedMatrixAddon } from './types';

export const {
  isSupported,
  NativeLedMatrix,
}: LedMatrixAddon = require('bindings')('rpi-led-matrix');

export const {
  defaultMatrixOptions,
  defaultRuntimeOptions,
} = NativeLedMatrix;

// export class LedMatrix {

// }
