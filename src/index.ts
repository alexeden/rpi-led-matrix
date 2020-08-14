export * from './types';
export * from './utils';

import { LedMatrixAddon } from './types';

export const {
  isSupported,
  LedMatrix,
}: LedMatrixAddon = require('bindings')('rpi-led-matrix');
